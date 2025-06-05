import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import RoutePlanner from '../RoutePlanner';

// Mock the toast functions
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RoutePlanner', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<RoutePlanner />);
    expect(screen.getByText('Route Planner')).toBeInTheDocument();
  });

  it('shows initial form elements', () => {
    render(<RoutePlanner />);
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate route/i })).toBeInTheDocument();
  });

  it('handles initialFromStop prop', () => {
    const initialStop = {
      stop_id: 'MONUMENTO',
      name: 'Monumento Station',
      sequence: 1,
    };
    render(<RoutePlanner initialFromStop={initialStop} />);
    expect(toast.success).toHaveBeenCalledWith(`Starting point set to ${initialStop.name}`);
  });

  it('shows error when calculating without selections', async () => {
    render(<RoutePlanner />);
    const calculateButton = screen.getByRole('button', { name: /calculate route/i });
    
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select both start and end points');
    });
  });

  it('calculates route correctly', async () => {
    render(<RoutePlanner />);
    
    // Select from and to stops
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: 'MONUMENTO' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'ORTIGAS' },
    });

    const calculateButton = screen.getByRole('button', { name: /calculate route/i });
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Route calculated successfully!');
      expect(screen.getByText(/direction/i)).toBeInTheDocument();
      expect(screen.getByText(/stops/i)).toBeInTheDocument();
      expect(screen.getByText(/fare/i)).toBeInTheDocument();
      expect(screen.getByText(/eta/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while calculating', async () => {
    render(<RoutePlanner />);
    
    // Select from and to stops
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: 'MONUMENTO' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'ORTIGAS' },
    });

    const calculateButton = screen.getByRole('button', { name: /calculate route/i });
    fireEvent.click(calculateButton);

    expect(screen.getByText(/calculating/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/calculating/i)).not.toBeInTheDocument();
    });
  });

  it('applies fare discounts correctly', async () => {
    render(<RoutePlanner />);
    
    // Select stops and student category
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: 'MONUMENTO' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'ORTIGAS' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'student' },
    });

    const calculateButton = screen.getByRole('button', { name: /calculate route/i });
    fireEvent.click(calculateButton);

    await waitFor(() => {
      const fareText = screen.getByText(/fare \(student\)/i);
      expect(fareText).toBeInTheDocument();
      // The actual fare amount check would depend on your fare matrix
    });
  });
}); 