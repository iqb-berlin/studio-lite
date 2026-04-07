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
  coverageDirectory: '../../coverage/apps/api'
  // No setupFilesAfterEnv here - backend doesn't need browser mocks
};
