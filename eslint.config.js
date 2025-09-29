// Flat ESLint config for ESLint v9
// Migrated from legacy .eslintrc.cjs; supports React (JSX) and Node API code.
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginImport from "eslint-plugin-import";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default [
  // Ignore patterns
  {
    ignores: [
      "build/**",
      "dist/**",
      "node_modules/**",
      "scripts/**",
      "**/*.config.js",
      "**/*.config.cjs",
    ],
  },
  js.configs.recommended,
  // Front-end (React) files
  {
    files: ["src/**/*.{js,jsx}", "test/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        // Allow fetch & process in client code that might be SSR aware
        fetch: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      import: pluginImport,
      "unused-imports": pluginUnusedImports,
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react/prop-types": "off",
      "react/jsx-uses-react": "off", // React 17+ JSX transform
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "import/no-unresolved": "off",
      "unused-imports/no-unused-imports": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Temporary relaxations to unblock migration; TODO tighten later
      "no-unused-vars": "off",
      "no-empty": "off",
    },
  },
  // Backend Node API files (CommonJS style)
  {
    files: ["api/**/*.js", "server.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.node,
        Buffer: "readonly",
      },
    },
    plugins: {
      import: pluginImport,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "import/no-unresolved": "off",
      "unused-imports/no-unused-imports": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
      "no-empty": "off",
    },
  },
];
