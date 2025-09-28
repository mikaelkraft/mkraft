module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/react',
    'prettier'
  ],
  plugins: ['unused-imports'],
  rules: {
    'react/prop-types': 'off',
    'import/no-unresolved': 'off', // Vite + aliases handled separately
    'unused-imports/no-unused-imports': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  },
  ignorePatterns: [
    'build/',
    'dist/',
    'node_modules/',
    'scripts/',
    '**/*.config.js',
    '**/*.config.cjs'
  ]
};
