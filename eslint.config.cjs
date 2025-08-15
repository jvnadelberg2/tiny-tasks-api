const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Ignore patterns (replaces .eslintignore in ESLint v9)
  {
    ignores: [
      'node_modules/',
      'coverage/',
      '.nyc_output/',
      'dist/',
      'build/',
      '*.min.js',
    ],
  },

  // Base config
  js.configs.recommended,

  // Project-wide rules
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',                      // allow server logs
      'no-empty': ['error', { allowEmptyCatch: true }], // allow intentionally empty catch {}
    },
  },

  // Tests
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
