import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Run cleanup automatically after each test
afterEach(() => {
  cleanup();
});
