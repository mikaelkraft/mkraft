import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  include: ['src/**/*.test.{js,jsx}', 'test/**/*.test.{js,jsx}'],
  },
});
