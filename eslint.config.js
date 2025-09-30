// Flat ESLint config for ESLint v9
// Migrated from legacy .eslintrc.cjs; supports React (JSX) and Node API code.
const js = require("@eslint/js");
const pluginReact = require("eslint-plugin-react");
const pluginReactHooks = require("eslint-plugin-react-hooks");
const pluginImport = require("eslint-plugin-import");
const pluginUnusedImports = require("eslint-plugin-unused-imports");
const globals = require("globals");

module.exports = [
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
      "no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-empty": ["warn", { allowEmptyCatch: true }],
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
      "unused-imports/no-unused-imports": "off",
      // Allow exploratory variable declarations in backend handlers without warnings
      "no-unused-vars": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
  // Tests – allow importing helpers/components not always referenced directly (e.g. JSX usage inside render wrappers)
  {
    files: ["test/**/*.{js,jsx}"],
    rules: {
      "unused-imports/no-unused-imports": "off",
      // Keep no-unused-vars but ignore everything starting with anything (effectively off) to avoid noisy unused param warnings in test data builders
      "no-unused-vars": ["off"],
    },
  },
  // Placeholder / scaffold-heavy page feature areas – disable noisy rules so Problems tab focuses on real code.
  // These directories contain WIP visual scaffolds where many components are intentionally imported for future composition.
  {
    files: [
      "src/pages/blog-content-hub/**/*.{js,jsx}",
      "src/pages/portfolio-home-hero/**/*.{js,jsx}",
      "src/pages/projects-portfolio-grid/**/*.{js,jsx}",
      "src/pages/project-detail/**/*.{js,jsx}",
      "src/pages/documentation/**/*.{js,jsx}",
      "src/pages/search/**/*.{js,jsx}",
      "src/pages/blog-post/**/*.{js,jsx}",
      "src/pages/admin-dashboard-content-management/**/*.{js,jsx}",
    ],
    rules: {
      "unused-imports/no-unused-imports": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
