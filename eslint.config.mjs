// Lint configuration of the workspace (Flat Config, ESLint 10).
//
// The TypeScript rules come from `@iqb/eslint-config/compat`: the effective rules of
// `@iqb/eslint-config` 2.2.0 under their current names, formatting in `@stylistic` and imports in
// `import-x`. It also hands the TypeScript parser to the import rules, without which
// `import-x/no-cycle` cannot read an imported file and reports nothing (#2166). Its default export is
// a different rule set and not used here. What follows are this repository's own additions.
import globals from 'globals';
import javascript from '@iqb/eslint-config/javascript';
import compat from '@iqb/eslint-config/compat';

const compatRestrictedSyntax = compat.find(config => config.name === 'iqb/compat-typescript')
  .rules['no-restricted-syntax'];

export default [
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
  ...javascript,
  ...compat,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        // One program from tsconfig.base.json, as before. The project service would pick each
        // file's nearest tsconfig instead, which can change what the type-aware rules report.
        projectService: false,
        project: './tsconfig.base.json',
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    // Tables sort with TextSortTableDataSource: text as the API sorts it, without converting
    // numbers. A `new MatTableDataSource` would silently fall back to character-code order (#1872).
    files: ['apps/frontend/src/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        ...compatRestrictedSyntax,
        {
          selector: "NewExpression[callee.name='MatTableDataSource']",
          message: 'Use TextSortTableDataSource instead: it sorts text as the API does (#1872).'
        }
      ]
    }
  },
  {
    // Build and Jest configurations are CommonJS and run under Node.
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  }
];
