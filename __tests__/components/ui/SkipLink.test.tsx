import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { SkipLink } from '@/components/ui/SkipLink';

describe('SkipLink', () => {
  it('renders an anchor pointing to the main content target', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('uses sr-only by default and reveals on focus', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    // The combination of these two utility classes is the contract — without
    // sr-only the link is always visible, without focus:not-sr-only it never
    // shows.
    expect(link.className).toMatch(/\bsr-only\b/);
    expect(link.className).toMatch(/focus:not-sr-only/);
  });
});
