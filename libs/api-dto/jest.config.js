module.exports = {
  displayName: 'api-dto',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  // ESM mode, like the api's (see .env here). It has no `jest` global: a spec that mocks imports
  // it from '@jest/globals', and `jest.mock()` replaces nothing (see apps/api/jest.setup.esm.ts).
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', useESM: true }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/api-dto',
  // See apps/api/jest.config.ts: without this only the files a spec imports are counted.
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts'
  ]
};
