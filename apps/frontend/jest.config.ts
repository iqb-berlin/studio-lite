export default {
  displayName: 'frontend',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {},
  coverageDirectory: '../../coverage/apps/frontend',
  // See apps/api/jest.config.ts for why this list exists. Only .ts: jest-preset-angular
  // instruments the component templates as well, which adds 161 html files whose lines say
  // whether a component was ever rendered, not whether anything about it was tested.
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/test-setup.ts',
    '!src/environments/**'
  ],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  // See the stub's own comment: the shared DTOs carry @nestjs/swagger decorators, and from Nest 12
  // on that package is ES-module-only. The frontend never reads swagger metadata, so its specs get
  // decorators that do nothing instead of the real, unloadable package.
  moduleNameMapper: {
    '^@nestjs/swagger$': '<rootDir>/src/test-stubs/nestjs-swagger.stub.ts'
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  testEnvironment: 'jsdom'
};
