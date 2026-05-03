import { describe, expect, it, beforeEach } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { THEME_STORAGE_KEY } from '@/lib/theme';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('reflects the light state when <html> does not have the dark class', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to dark theme' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects the dark state when <html> has the dark class', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to light theme' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles light → dark — sets the dark class and persists to localStorage', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to dark theme' });

    await act(async () => {
      await userEvent.click(button);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('toggles dark → light — removes the dark class and persists to localStorage', async () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to light theme' });

    await act(async () => {
      await userEvent.click(button);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('does not crash when localStorage is unavailable on toggle', async () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error('quota');
    };
    try {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: 'Switch to dark theme' });
      await act(async () => {
        await userEvent.click(button);
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    } finally {
      window.localStorage.setItem = original;
    }
  });
});
