function cov_2eiyc1844r() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/jest.config.ts";
  var hash = "46f3ae70c158efc540466ea1704fd9ffb6642622";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/jest.config.ts",
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "46f3ae70c158efc540466ea1704fd9ffb6642622"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_2eiyc1844r = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_2eiyc1844r();
/* eslint-disable */
export default {
  displayName: 'frontend',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {},
  coverageDirectory: '../../coverage/apps/frontend',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': ['jest-preset-angular', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }]
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: ['jest-preset-angular/build/serializers/no-ng-attributes', 'jest-preset-angular/build/serializers/ng-snapshot', 'jest-preset-angular/build/serializers/html-comment']
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMmVpeWMxODQ0ciIsImFjdHVhbENvdmVyYWdlIiwiZGlzcGxheU5hbWUiLCJwcmVzZXQiLCJzZXR1cEZpbGVzQWZ0ZXJFbnYiLCJnbG9iYWxzIiwiY292ZXJhZ2VEaXJlY3RvcnkiLCJ0cmFuc2Zvcm0iLCJ0c2NvbmZpZyIsInN0cmluZ2lmeUNvbnRlbnRQYXRoUmVnZXgiLCJ0cmFuc2Zvcm1JZ25vcmVQYXR0ZXJucyIsInNuYXBzaG90U2VyaWFsaXplcnMiXSwic291cmNlcyI6WyJqZXN0LmNvbmZpZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICBkaXNwbGF5TmFtZTogJ2Zyb250ZW5kJyxcbiAgcHJlc2V0OiAnLi4vLi4vamVzdC5wcmVzZXQuanMnLFxuICBzZXR1cEZpbGVzQWZ0ZXJFbnY6IFsnPHJvb3REaXI+L3NyYy90ZXN0LXNldHVwLnRzJ10sXG4gIGdsb2JhbHM6IHt9LFxuICBjb3ZlcmFnZURpcmVjdG9yeTogJy4uLy4uL2NvdmVyYWdlL2FwcHMvZnJvbnRlbmQnLFxuICB0cmFuc2Zvcm06IHtcbiAgICAnXi4rXFxcXC4odHN8bWpzfGpzfGh0bWwpJCc6IFtcbiAgICAgICdqZXN0LXByZXNldC1hbmd1bGFyJyxcbiAgICAgIHtcbiAgICAgICAgdHNjb25maWc6ICc8cm9vdERpcj4vdHNjb25maWcuc3BlYy5qc29uJyxcbiAgICAgICAgc3RyaW5naWZ5Q29udGVudFBhdGhSZWdleDogJ1xcXFwuKGh0bWx8c3ZnKSQnXG4gICAgICB9XG4gICAgXVxuICB9LFxuICB0cmFuc2Zvcm1JZ25vcmVQYXR0ZXJuczogWydub2RlX21vZHVsZXMvKD8hLipcXFxcLm1qcyQpJ10sXG4gIHNuYXBzaG90U2VyaWFsaXplcnM6IFtcbiAgICAnamVzdC1wcmVzZXQtYW5ndWxhci9idWlsZC9zZXJpYWxpemVycy9uby1uZy1hdHRyaWJ1dGVzJyxcbiAgICAnamVzdC1wcmVzZXQtYW5ndWxhci9idWlsZC9zZXJpYWxpemVycy9uZy1zbmFwc2hvdCcsXG4gICAgJ2plc3QtcHJlc2V0LWFuZ3VsYXIvYnVpbGQvc2VyaWFsaXplcnMvaHRtbC1jb21tZW50J1xuICBdXG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsY0FBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsY0FBQTtBQWZaO0FBQ0EsZUFBZTtFQUNiRSxXQUFXLEVBQUUsVUFBVTtFQUN2QkMsTUFBTSxFQUFFLHNCQUFzQjtFQUM5QkMsa0JBQWtCLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQztFQUNuREMsT0FBTyxFQUFFLENBQUMsQ0FBQztFQUNYQyxpQkFBaUIsRUFBRSw4QkFBOEI7RUFDakRDLFNBQVMsRUFBRTtJQUNULHlCQUF5QixFQUFFLENBQ3pCLHFCQUFxQixFQUNyQjtNQUNFQyxRQUFRLEVBQUUsOEJBQThCO01BQ3hDQyx5QkFBeUIsRUFBRTtJQUM3QixDQUFDO0VBRUwsQ0FBQztFQUNEQyx1QkFBdUIsRUFBRSxDQUFDLDRCQUE0QixDQUFDO0VBQ3ZEQyxtQkFBbUIsRUFBRSxDQUNuQix3REFBd0QsRUFDeEQsbURBQW1ELEVBQ25ELG9EQUFvRDtBQUV4RCxDQUFDIiwiaWdub3JlTGlzdCI6W119