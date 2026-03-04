#!/usr/bin/env node
/**
 * Seed Supabase with local fare/station data
 * Run this once to populate your database with existing data
 * 
 * Usage: node scripts/seed-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Load env
const envPath = join(ROOT, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  console.log('   Use the service_role key (not anon) for seeding.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TRANSPORT_TYPES = ['lrt-1', 'lrt-2', 'mrt-3', 'edsa-carousel'];

async function seedFareMatrices() {
  console.log('\n📊 Seeding fare matrices...');

  for (const transportType of TRANSPORT_TYPES) {
    const filePath = join(ROOT, 'src/transport', transportType, 'data/fareMatrix.json');
    
    if (!existsSync(filePath)) {
      console.warn(`⚠️  No fareMatrix.json for ${transportType}`);
      continue;
    }

    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    const record = {
      transport_type: transportType,
      effective_date: data.fare_info?.effective_date || new Date().toISOString().split('T')[0],
      note: data.fare_info?.note || '',
      stations: data.stations || [],
      beep_card: data.beep_card || null,
      single_journey: data.single_journey || null,
      regular: data.regular || null,
      student: data.student || null,
      pwd: data.pwd || null,
      senior: data.senior || null,
    };

    const { error } = await supabase
      .from('fare_matrices')
      .upsert(record, { onConflict: 'transport_type' });

    if (error) {
      console.error(`❌ Failed to seed ${transportType}:`, error.message);
    } else {
      console.log(`✅ ${transportType} fare matrix`);
    }
  }
}

async function seedStations() {
  console.log('\n🚉 Seeding stations...');

  for (const transportType of TRANSPORT_TYPES) {
    const isCarousel = transportType === 'edsa-carousel';
    const fileName = isCarousel ? 'stops.json' : 'stations.json';
    const filePath = join(ROOT, 'src/transport', transportType, 'data', fileName);
    
    if (!existsSync(filePath)) {
      console.warn(`⚠️  No ${fileName} for ${transportType}`);
      continue;
    }

    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const stationList = isCarousel ? data : (data.stations || []);

    if (!Array.isArray(stationList)) {
      console.warn(`⚠️  Invalid station data format for ${transportType}`);
      continue;
    }

    const records = stationList.map(s => ({
      transport_type: transportType,
      station_id: s.station_id || s.stop_id,
      name: s.name,
      sequence: s.sequence,
      latitude: s.coordinates?.latitude || s.lat || null,
      longitude: s.coordinates?.longitude || s.lng || null,
      municipality: s.municipality || null,
      metadata: {
        ...(s.connections && { connections: s.connections }),
        ...(s.landmarks && { landmarks: s.landmarks }),
        ...(s.facilities && { facilities: s.facilities }),
      },
    }));

    // Delete existing and insert fresh
    await supabase.from('stations').delete().eq('transport_type', transportType);
    
    const { error } = await supabase.from('stations').insert(records);

    if (error) {
      console.error(`❌ Failed to seed ${transportType} stations:`, error.message);
    } else {
      console.log(`✅ ${transportType}: ${records.length} stations`);
    }
  }
}

async function main() {
  console.log('🌱 Seeding andarTayo! Supabase Database');
  
  try {
    await seedFareMatrices();
    await seedStations();
    console.log('\n✨ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

main();
