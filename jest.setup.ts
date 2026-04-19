import '@testing-library/jest-dom/jest-globals';

// Recharts' ResponsiveContainer uses ResizeObserver, which jsdom does not implement.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverMock;
