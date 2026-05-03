import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

import {
  applyTheme,
  getSystemTheme,
  readStoredTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
  writeStoredTheme,
} from '@/lib/theme';

describe('theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('readStoredTheme', () => {
    it('returns null when no value is stored', () => {
      expect(readStoredTheme()).toBeNull();
    });

    it('returns "light" when "light" is stored', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
      expect(readStoredTheme()).toBe('light');
    });

    it('returns "dark" when "dark" is stored', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      expect(readStoredTheme()).toBe('dark');
    });

    it('returns null for invalid stored values', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'pink');
      expect(readStoredTheme()).toBeNull();
    });

    it('returns null when localStorage throws', () => {
      const original = window.localStorage.getItem;
      window.localStorage.getItem = () => {
        throw new Error('blocked');
      };
      try {
        expect(readStoredTheme()).toBeNull();
      } finally {
        window.localStorage.getItem = original;
      }
    });
  });

  describe('writeStoredTheme', () => {
    it('persists "dark"', () => {
      writeStoredTheme('dark');
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('persists "light"', () => {
      writeStoredTheme('light');
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });

    it('does not throw when localStorage is unavailable', () => {
      const original = window.localStorage.setItem;
      window.localStorage.setItem = () => {
        throw new Error('quota');
      };
      try {
        expect(() => writeStoredTheme('dark')).not.toThrow();
      } finally {
        window.localStorage.setItem = original;
      }
    });
  });

  describe('getSystemTheme', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('returns "dark" when system prefers dark', () => {
      window.matchMedia = ((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
      expect(getSystemTheme()).toBe('dark');
    });

    it('returns "light" when system does not prefer dark', () => {
      window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
      expect(getSystemTheme()).toBe('light');
    });
  });

  describe('resolveInitialTheme', () => {
    it('prefers stored value over system preference', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
      window.matchMedia = ((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
      expect(resolveInitialTheme()).toBe('light');
    });

    it('falls back to system preference when nothing is stored', () => {
      window.matchMedia = ((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
      expect(resolveInitialTheme()).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    it('adds the dark class for "dark"', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes the dark class for "light"', () => {
      document.documentElement.classList.add('dark');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('is idempotent when toggled twice', () => {
      applyTheme('dark');
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      applyTheme('light');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
