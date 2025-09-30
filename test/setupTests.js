// Global test setup for Vitest (React 18, jsdom)
// Provides: automatic React import for JSX, proper act environment flag, and Helmet cleanup if needed.
import * as React from "react";
import { afterEach, beforeAll } from "vitest";

// Expose React globally so older test files with JSX but no explicit import still work
// (Alternative is enabling jsxImportSource or adding explicit imports.)
// eslint-disable-next-line no-undef
global.React = React;

// React Testing Library act environment flag (React 18)
// eslint-disable-next-line no-undef
global.IS_REACT_ACT_ENVIRONMENT = true;

// Basic cleanup for Helmet side-effects could be added here if leaks appear.
beforeAll(() => {
  // Placeholder for any global polyfills later.
});

afterEach(() => {
  // Could add custom cleanup steps here.
});
