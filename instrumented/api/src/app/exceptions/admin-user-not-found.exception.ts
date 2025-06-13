function cov_2dayfastye() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/admin-user-not-found.exception.ts";
  var hash = "d4df8ee503e819122a211af793c47d74f518a93c";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/admin-user-not-found.exception.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 64
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
            column: 46
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
    hash: "d4df8ee503e819122a211af793c47d74f518a93c"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_2dayfastye = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_2dayfastye();
import { NotFoundException } from '@nestjs/common';
export class AdminUserNotFoundException extends NotFoundException {
  constructor(userId: number, method: string) {
    cov_2dayfastye().f[0]++;
    const description = (cov_2dayfastye().s[0]++, `Admin user with id ${userId} not found`);
    const objectOrError = (cov_2dayfastye().s[1]++, {
      id: userId,
      controller: 'admin/users',
      method,
      description
    });
    cov_2dayfastye().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMmRheWZhc3R5ZSIsImFjdHVhbENvdmVyYWdlIiwiTm90Rm91bmRFeGNlcHRpb24iLCJBZG1pblVzZXJOb3RGb3VuZEV4Y2VwdGlvbiIsImNvbnN0cnVjdG9yIiwidXNlcklkIiwibWV0aG9kIiwiZiIsImRlc2NyaXB0aW9uIiwicyIsIm9iamVjdE9yRXJyb3IiLCJpZCIsImNvbnRyb2xsZXIiXSwic291cmNlcyI6WyJhZG1pbi11c2VyLW5vdC1mb3VuZC5leGNlcHRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90Rm91bmRFeGNlcHRpb24gfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbmV4cG9ydCBjbGFzcyBBZG1pblVzZXJOb3RGb3VuZEV4Y2VwdGlvbiBleHRlbmRzIE5vdEZvdW5kRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IodXNlcklkOiBudW1iZXIsIG1ldGhvZDogc3RyaW5nKSB7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBgQWRtaW4gdXNlciB3aXRoIGlkICR7dXNlcklkfSBub3QgZm91bmRgO1xuICAgIGNvbnN0IG9iamVjdE9yRXJyb3IgPSB7XG4gICAgICBpZDogdXNlcklkLCBjb250cm9sbGVyOiAnYWRtaW4vdXNlcnMnLCBtZXRob2QsIGRlc2NyaXB0aW9uXG4gICAgfTtcbiAgICBzdXBlcihvYmplY3RPckVycm9yKTtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxjQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxjQUFBO0FBZlosU0FBU0UsaUJBQWlCLFFBQVEsZ0JBQWdCO0FBRWxELE9BQU8sTUFBTUMsMEJBQTBCLFNBQVNELGlCQUFpQixDQUFDO0VBQ2hFRSxXQUFXQSxDQUFDQyxNQUFNLEVBQUUsTUFBTSxFQUFFQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0lBQUFOLGNBQUEsR0FBQU8sQ0FBQTtJQUMxQyxNQUFNQyxXQUFXLElBQUFSLGNBQUEsR0FBQVMsQ0FBQSxPQUFHLHNCQUFzQkosTUFBTSxZQUFZO0lBQzVELE1BQU1LLGFBQWEsSUFBQVYsY0FBQSxHQUFBUyxDQUFBLE9BQUc7TUFDcEJFLEVBQUUsRUFBRU4sTUFBTTtNQUFFTyxVQUFVLEVBQUUsYUFBYTtNQUFFTixNQUFNO01BQUVFO0lBQ2pELENBQUM7SUFBQ1IsY0FBQSxHQUFBUyxDQUFBO0lBQ0YsS0FBSyxDQUFDQyxhQUFhLENBQUM7RUFDdEI7QUFDRiIsImlnbm9yZUxpc3QiOltdfQ==