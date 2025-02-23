/**
 * Jest Setup File
 * This file contains common mocks and setup configurations for Jest tests.
 * It is automatically included in all test files via the Jest configuration.
 */

// Mock helpers
jest.mock('../project/src/utils/helpers.js', () => ({
  selectId: jest.fn(),
  select: jest.fn(),
  selectAll: jest.fn(),
}));

// Mock gsap library
jest.mock('../project/src/utils/animation.js', () => ({
  gsap: {
    set: jest.fn(),
    to: jest.fn(),
  },
}));

// Mock ResizeObserver
global.ResizeObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};
