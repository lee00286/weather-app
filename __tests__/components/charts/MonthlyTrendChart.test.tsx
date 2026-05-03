import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import type { MonthlyPoint } from '@/lib/monthlyStitch';

function makePoints(count: number): MonthlyPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2024-06-${String(i + 1).padStart(2, '0')}`,
    label: `Jun ${i + 1}`,
    fullLabel: `Jun ${i + 1}`,
    actual: 18 + i * 0.3,
    historical: 17 + i * 0.2,
  }));
}

describe('MonthlyTrendChart', () => {
  it('renders with an accessible label when data is provided', () => {
    render(<MonthlyTrendChart points={makePoints(30)} />);
    expect(screen.getByLabelText('Monthly temperature trend chart')).toBeInTheDocument();
  });

  it('renders empty state when points array is empty', () => {
    render(<MonthlyTrendChart points={[]} />);
    expect(screen.getByText('No temperature data')).toBeInTheDocument();
    expect(screen.queryByLabelText('Monthly temperature trend chart')).not.toBeInTheDocument();
  });

  it('renders with data containing nulls (gaps)', () => {
    const points: MonthlyPoint[] = [
      ...makePoints(10),
      {
        date: '2024-06-11',
        label: 'Jun 11',
        fullLabel: 'Jun 11',
        actual: null,
        historical: null,
      },
      {
        date: '2024-06-12',
        label: 'Jun 12',
        fullLabel: 'Jun 12',
        actual: null,
        historical: 18,
      },
    ];
    render(<MonthlyTrendChart points={points} />);
    expect(screen.getByLabelText('Monthly temperature trend chart')).toBeInTheDocument();
  });

  it('renders the chart heading', () => {
    render(<MonthlyTrendChart points={makePoints(30)} />);
    expect(screen.getByText('Monthly temperature trend')).toBeInTheDocument();
  });

  it('renders with a single point', () => {
    render(<MonthlyTrendChart points={makePoints(1)} />);
    expect(screen.getByLabelText('Monthly temperature trend chart')).toBeInTheDocument();
  });
});
