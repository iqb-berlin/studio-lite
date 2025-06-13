function cov_rfcxgeoec() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/environments/environment.prod.ts";
  var hash = "73f1fb6e5a5520e44bac599743f1e71ceea04ba2";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/environments/environment.prod.ts",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 27
        },
        end: {
          line: 4,
          column: 1
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      "0": 0
    },
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "73f1fb6e5a5520e44bac599743f1e71ceea04ba2"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_rfcxgeoec = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_rfcxgeoec();
export const environment = (cov_rfcxgeoec().s[0]++, {
  production: true,
  backendUrl: 'api/'
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfcmZjeGdlb2VjIiwiYWN0dWFsQ292ZXJhZ2UiLCJlbnZpcm9ubWVudCIsInMiLCJwcm9kdWN0aW9uIiwiYmFja2VuZFVybCJdLCJzb3VyY2VzIjpbImVudmlyb25tZW50LnByb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGVudmlyb25tZW50ID0ge1xuICBwcm9kdWN0aW9uOiB0cnVlLFxuICBiYWNrZW5kVXJsOiAnYXBpLydcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsYUFBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsYUFBQTtBQWZaLE9BQU8sTUFBTUUsV0FBVyxJQUFBRixhQUFBLEdBQUFHLENBQUEsT0FBRztFQUN6QkMsVUFBVSxFQUFFLElBQUk7RUFDaEJDLFVBQVUsRUFBRTtBQUNkLENBQUMiLCJpZ25vcmVMaXN0IjpbXX0=