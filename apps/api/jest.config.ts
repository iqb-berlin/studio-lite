/* eslint-disable */
export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  transformIgnorePatterns: [
    'node_modules/(?!mathml2omml/)'
  ],
  coverageDirectory: '../../coverage/apps/api',
  // Without this jest counts only the files a spec happens to import, so untested files
  // are missing from the report altogether and the percentage flatters. The bootstrap and
  // the environments carry no logic worth a test and would only depress the number.
  //
  // Every project measures its own sources and nothing else. A `../../libs/**` glob does not
  // work: jest only discovers files below its roots, and a measured run showed no library
  // file in this report either way. What libs/ is worth is therefore what its own suite
  // says - see coverage/by-project/ and the note in scripts/merge-coverage.sh.
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/environments/**'
  ]
  // No setupFilesAfterEnv here - backend doesn't need browser mocks
};
