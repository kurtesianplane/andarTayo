import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EDSACarouselRoutePlanner from '../../transport/edsa-carousel/components/RoutePlanner';

describe('EDSACarouselRoutePlanner', () => {
  it('renders without crashing', () => {
    render(<EDSACarouselRoutePlanner />);
    expect(screen.getByText('EDSA Carousel')).toBeInTheDocument();
    expect(screen.getByText('Route Planner')).toBeInTheDocument();
  });

  it('shows the main form controls', () => {
    render(<EDSACarouselRoutePlanner />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('From Stop')).toBeInTheDocument();
    expect(screen.getByText('To Stop')).toBeInTheDocument();
    expect(screen.getByText('Passenger Type')).toBeInTheDocument();
  });

  it('applies initialFromStop', async () => {
    render(
      <EDSACarouselRoutePlanner
        initialFromStop={{
          stop_id: 'MONUMENTO',
          name: 'Monumento',
          sequence: 1,
        }}
      />,
    );

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects[0]).toHaveValue('MONUMENTO');
    });
  });
});