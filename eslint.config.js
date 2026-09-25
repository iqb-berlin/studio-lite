// Lint-Konfiguration des Workspaces (Flat Config, ESLint 10).
//
// Bis hierher kam der Regelsatz über `@iqb/eslint-config`, das seinerseits airbnb erbte.
// airbnb hat nie eine Flat Config bekommen, und `@typescript-eslint` 7 unterstützt kein
// TypeScript 5.9 mehr -- beides zusammen war die Sackgasse (siehe #1692). Der Satz steht
// jetzt in `eslint.rules.js` und gehört diesem Repo.
const tseslint = require('typescript-eslint');
const stylistic = require('@stylistic/eslint-plugin');
const importX = require('eslint-plugin-import-x');
const globals = require('globals');
const rules = require('./eslint.rules');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      'coverage/**',
      '.nx/**',
      'tmp/**',
      '**/*.d.ts'
    ]
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.base.json',
        ecmaVersion: 12,
        sourceType: 'module'
      },
      globals: { ...globals.browser, ...globals.es2021 }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@stylistic': stylistic,
      'import-x': importX
    },
    settings: {
      'import-x/resolver': { node: { extensions: ['.js', '.ts'] } }
    },
    rules: {
      ...rules,
      // TypeScript löst Modulpfade selbst auf und kennt die Aliase aus tsconfig.base.json.
      // airbnb-typescript hat diese beiden aus demselben Grund abgeschaltet; ohne das meldet
      // der Resolver jeden projektinternen Import als unauflösbar.
      'import-x/no-unresolved': 'off',
      'import-x/named': 'off'
    }
  },
  {
    // Cypress-Spezifikationen: `expect(...).to.be.true` ist ein Ausdruck ohne Wirkung,
    // und Ketten von `cy`-Aufrufen sind hier die übliche Schreibweise.
    files: ['apps/frontend-e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': ['error', { allowTaggedTemplates: true }],
      'newline-per-chained-call': 'off'
    }
  }
];
