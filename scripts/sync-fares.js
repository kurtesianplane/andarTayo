#!/usr/bin/env node
/**
 * Sync fare data from Supabase to local JSON files
 * Run this script before build to pull latest fare data
 * 
 * Usage: 
 *   node scripts/sync-fares.js
 *   npm run sync-fares
 * 
 * Environment variables:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_ANON_KEY - Your Supabase anon/public key
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Load env from .env file if present
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
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('⚠️  Supabase credentials not found. Skipping fare sync.');
  console.log('   Set SUPABASE_URL and SUPABASE_ANON_KEY to enable.');
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TRANSPORT_PATHS = {
  'lrt-1': 'src/transport/lrt-1/data',
  'lrt-2': 'src/transport/lrt-2/data',
  'mrt-3': 'src/transport/mrt-3/data',
  'edsa-carousel': 'src/transport/edsa-carousel/data',
};

async function syncFareMatrices() {
  console.log('📡 Fetching fare matrices from Supabase...');
  
  const { data: fareMatrices, error } = await supabase
    .from('fare_matrices')
    .select('*')
    .order('transport_type');

  if (error) {
    console.error('❌ Error fetching fare matrices:', error.message);
    process.exit(1);
  }

  if (!fareMatrices || fareMatrices.length === 0) {
    console.log('ℹ️  No fare matrices found in database. Using local files.');
    return;
  }

  for (const matrix of fareMatrices) {
    const transportPath = TRANSPORT_PATHS[matrix.transport_type];
    if (!transportPath) {
      console.warn(`⚠️  Unknown transport type: ${matrix.transport_type}`);
      continue;
    }

    const filePath = join(ROOT, transportPath, 'fareMatrix.json');
    const fareData = {
      fare_info: {
        currency: 'PHP',
        effective_date: matrix.effective_date,
        last_updated: matrix.updated_at,
        note: matrix.note || '',
      },
      stations: matrix.stations,
      ...(matrix.beep_card && { beep_card: matrix.beep_card }),
      ...(matrix.single_journey && { single_journey: matrix.single_journey }),
      ...(matrix.regular && { regular: matrix.regular }),
      ...(matrix.student && { student: matrix.student }),
      ...(matrix.pwd && { pwd: matrix.pwd }),
      ...(matrix.senior && { senior: matrix.senior }),
    };

    writeFileSync(filePath, JSON.stringify(fareData, null, 2));
    console.log(`✅ Updated ${matrix.transport_type} fare matrix`);
  }
}

async function syncStations() {
  console.log('📡 Fetching stations from Supabase...');
  
  const { data: stations, error } = await supabase
    .from('stations')
    .select('*')
    .order('transport_type, sequence');

  if (error) {
    console.error('❌ Error fetching stations:', error.message);
    return;
  }

  if (!stations || stations.length === 0) {
    console.log('ℹ️  No stations found in database. Using local files.');
    return;
  }

  // Group stations by transport type
  const grouped = stations.reduce((acc, station) => {
    if (!acc[station.transport_type]) acc[station.transport_type] = [];
    acc[station.transport_type].push(station);
    return acc;
  }, {});

  for (const [transportType, stationList] of Object.entries(grouped)) {
    const transportPath = TRANSPORT_PATHS[transportType];
    if (!transportPath) continue;

    const isCarousel = transportType === 'edsa-carousel';
    const fileName = isCarousel ? 'stops.json' : 'stations.json';
    const filePath = join(ROOT, transportPath, fileName);

    // Read existing file to preserve line_info
    let existingData = {};
    if (existsSync(filePath)) {
      try {
        existingData = JSON.parse(readFileSync(filePath, 'utf-8'));
      } catch (e) {
        console.warn(`⚠️  Could not parse existing ${fileName}`);
      }
    }

    const stationData = isCarousel 
      ? stationList.map(s => ({
          stop_id: s.station_id,
          name: s.name,
          sequence: s.sequence,
          lat: s.latitude,
          lng: s.longitude,
          ...s.metadata,
        }))
      : {
          ...existingData,
          stations: stationList.map(s => ({
            station_id: s.station_id,
            name: s.name,
            sequence: s.sequence,
            coordinates: {
              latitude: s.latitude,
              longitude: s.longitude,
            },
            ...s.metadata,
          })),
        };

    writeFileSync(filePath, JSON.stringify(stationData, null, 2));
    console.log(`✅ Updated ${transportType} stations (${stationList.length} stations)`);
  }
}

async function main() {
  console.log('🚇 andarTayo! Fare Sync\n');
  
  try {
    await syncFareMatrices();
    await syncStations();
    console.log('\n✨ Sync complete!');
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

main();
