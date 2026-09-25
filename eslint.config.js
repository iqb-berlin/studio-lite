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
    // Build- und Jest-Konfigurationen liegen als CommonJS vor. Der TypeScript-Teil des
    // Regelsatzes braucht Typinformationen und damit die tsconfig, in der diese Dateien
    // nicht stehen -- sie bekommen deshalb den Teil, der ohne Typen auskommt.
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node }
    },
    plugins: { '@stylistic': stylistic },
    rules: Object.fromEntries(
      Object.entries(rules).filter(([name]) => !name.startsWith('@typescript-eslint/') &&
        !name.startsWith('import-x/'))
    )
  }
];
