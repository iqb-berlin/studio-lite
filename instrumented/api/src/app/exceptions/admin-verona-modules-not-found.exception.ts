function cov_276dojmsmv() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/admin-verona-modules-not-found.exception.ts";
  var hash = "896d5b24b0eecac009b17e701267a2897d8d593a";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/admin-verona-modules-not-found.exception.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 71
        }
      },
      "1": {
        start: {
          line: 6,
          column: 26
        },
        end: {
          line: 8,
          column: 5
        }
      },
      "2": {
        start: {
          line: 9,
          column: 4
        },
        end: {
          line: 9,
          column: 25
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 4,
            column: 2
          },
          end: {
            line: 4,
            column: 3
          }
        },
        loc: {
          start: {
            line: 4,
            column: 43
          },
          end: {
            line: 10,
            column: 3
          }
        },
        line: 4
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0
    },
    f: {
      "0": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "896d5b24b0eecac009b17e701267a2897d8d593a"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_276dojmsmv = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_276dojmsmv();
import { NotFoundException } from '@nestjs/common';
export class AdminVeronaModulesNotFoundException extends NotFoundException {
  constructor(key: string, method: string) {
    cov_276dojmsmv().f[0]++;
    const description = (cov_276dojmsmv().s[0]++, `Admin verona modules with id ${key} not found`);
    const objectOrError = (cov_276dojmsmv().s[1]++, {
      id: key,
      controller: 'admin/verona-modules',
      method,
      description
    });
    cov_276dojmsmv().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMjc2ZG9qbXNtdiIsImFjdHVhbENvdmVyYWdlIiwiTm90Rm91bmRFeGNlcHRpb24iLCJBZG1pblZlcm9uYU1vZHVsZXNOb3RGb3VuZEV4Y2VwdGlvbiIsImNvbnN0cnVjdG9yIiwia2V5IiwibWV0aG9kIiwiZiIsImRlc2NyaXB0aW9uIiwicyIsIm9iamVjdE9yRXJyb3IiLCJpZCIsImNvbnRyb2xsZXIiXSwic291cmNlcyI6WyJhZG1pbi12ZXJvbmEtbW9kdWxlcy1ub3QtZm91bmQuZXhjZXB0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5vdEZvdW5kRXhjZXB0aW9uIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuXG5leHBvcnQgY2xhc3MgQWRtaW5WZXJvbmFNb2R1bGVzTm90Rm91bmRFeGNlcHRpb24gZXh0ZW5kcyBOb3RGb3VuZEV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBtZXRob2Q6IHN0cmluZykge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gYEFkbWluIHZlcm9uYSBtb2R1bGVzIHdpdGggaWQgJHtrZXl9IG5vdCBmb3VuZGA7XG4gICAgY29uc3Qgb2JqZWN0T3JFcnJvciA9IHtcbiAgICAgIGlkOiBrZXksIGNvbnRyb2xsZXI6ICdhZG1pbi92ZXJvbmEtbW9kdWxlcycsIG1ldGhvZCwgZGVzY3JpcHRpb25cbiAgICB9O1xuICAgIHN1cGVyKG9iamVjdE9yRXJyb3IpO1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVZO0lBQUFBLGNBQUEsWUFBQUEsQ0FBQTtNQUFBLE9BQUFDLGNBQUE7SUFBQTtFQUFBO0VBQUEsT0FBQUEsY0FBQTtBQUFBO0FBQUFELGNBQUE7QUFmWixTQUFTRSxpQkFBaUIsUUFBUSxnQkFBZ0I7QUFFbEQsT0FBTyxNQUFNQyxtQ0FBbUMsU0FBU0QsaUJBQWlCLENBQUM7RUFDekVFLFdBQVdBLENBQUNDLEdBQUcsRUFBRSxNQUFNLEVBQUVDLE1BQU0sRUFBRSxNQUFNLEVBQUU7SUFBQU4sY0FBQSxHQUFBTyxDQUFBO0lBQ3ZDLE1BQU1DLFdBQVcsSUFBQVIsY0FBQSxHQUFBUyxDQUFBLE9BQUcsZ0NBQWdDSixHQUFHLFlBQVk7SUFDbkUsTUFBTUssYUFBYSxJQUFBVixjQUFBLEdBQUFTLENBQUEsT0FBRztNQUNwQkUsRUFBRSxFQUFFTixHQUFHO01BQUVPLFVBQVUsRUFBRSxzQkFBc0I7TUFBRU4sTUFBTTtNQUFFRTtJQUN2RCxDQUFDO0lBQUNSLGNBQUEsR0FBQVMsQ0FBQTtJQUNGLEtBQUssQ0FBQ0MsYUFBYSxDQUFDO0VBQ3RCO0FBQ0YiLCJpZ25vcmVMaXN0IjpbXX0=