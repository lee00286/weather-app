import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { NoticeCard } from '@/components/weather/NoticeCard';
import type { SeasonalNotice } from '@/lib/types';

describe('NoticeCard', () => {
  it('renders nothing when no notices', () => {
    const { container } = render(<NoticeCard notices={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders notice message', () => {
    const notices: SeasonalNotice[] = [
      { id: 'frost', message: 'Watch for icy surfaces.', type: 'tip', icon: '❄️' },
    ];
    render(<NoticeCard notices={notices} />);
    expect(screen.getByText('Watch for icy surfaces.')).toBeInTheDocument();
  });

  it('renders multiple notices', () => {
    const notices: SeasonalNotice[] = [
      { id: 'frost', message: 'Frost warning active.', type: 'tip', icon: '❄️' },
      { id: 'uv', message: 'Wear sunscreen today.', type: 'info', icon: '☀️' },
    ];
    render(<NoticeCard notices={notices} />);
    expect(screen.getByText('Frost warning active.')).toBeInTheDocument();
    expect(screen.getByText('Wear sunscreen today.')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const notices: SeasonalNotice[] = [
      { id: 'cherry', message: 'Cherry blossom season!', type: 'seasonal', icon: '🌸' },
    ];
    render(<NoticeCard notices={notices} />);
    expect(screen.getByText('🌸')).toBeInTheDocument();
  });
});
