function cov_1r1qf0xizf() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/admin-workspace-not-found.exception.ts";
  var hash = "76203e0927818070c5d8bda2e230e26d24ffa157";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/admin-workspace-not-found.exception.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 74
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
            column: 51
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
    hash: "76203e0927818070c5d8bda2e230e26d24ffa157"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1r1qf0xizf = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1r1qf0xizf();
import { NotFoundException } from '@nestjs/common';
export class AdminWorkspaceNotFoundException extends NotFoundException {
  constructor(workspaceId: number, method: string) {
    cov_1r1qf0xizf().f[0]++;
    const description = (cov_1r1qf0xizf().s[0]++, `Admin workspace with id ${workspaceId} not found`);
    const objectOrError = (cov_1r1qf0xizf().s[1]++, {
      id: workspaceId,
      controller: 'admin/workspace-groups',
      method,
      description
    });
    cov_1r1qf0xizf().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXIxcWYweGl6ZiIsImFjdHVhbENvdmVyYWdlIiwiTm90Rm91bmRFeGNlcHRpb24iLCJBZG1pbldvcmtzcGFjZU5vdEZvdW5kRXhjZXB0aW9uIiwiY29uc3RydWN0b3IiLCJ3b3Jrc3BhY2VJZCIsIm1ldGhvZCIsImYiLCJkZXNjcmlwdGlvbiIsInMiLCJvYmplY3RPckVycm9yIiwiaWQiLCJjb250cm9sbGVyIl0sInNvdXJjZXMiOlsiYWRtaW4td29ya3NwYWNlLW5vdC1mb3VuZC5leGNlcHRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90Rm91bmRFeGNlcHRpb24gfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbmV4cG9ydCBjbGFzcyBBZG1pbldvcmtzcGFjZU5vdEZvdW5kRXhjZXB0aW9uIGV4dGVuZHMgTm90Rm91bmRFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcih3b3Jrc3BhY2VJZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZykge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gYEFkbWluIHdvcmtzcGFjZSB3aXRoIGlkICR7d29ya3NwYWNlSWR9IG5vdCBmb3VuZGA7XG4gICAgY29uc3Qgb2JqZWN0T3JFcnJvciA9IHtcbiAgICAgIGlkOiB3b3Jrc3BhY2VJZCwgY29udHJvbGxlcjogJ2FkbWluL3dvcmtzcGFjZS1ncm91cHMnLCBtZXRob2QsIGRlc2NyaXB0aW9uXG4gICAgfTtcbiAgICBzdXBlcihvYmplY3RPckVycm9yKTtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxjQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxjQUFBO0FBZlosU0FBU0UsaUJBQWlCLFFBQVEsZ0JBQWdCO0FBRWxELE9BQU8sTUFBTUMsK0JBQStCLFNBQVNELGlCQUFpQixDQUFDO0VBQ3JFRSxXQUFXQSxDQUFDQyxXQUFXLEVBQUUsTUFBTSxFQUFFQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0lBQUFOLGNBQUEsR0FBQU8sQ0FBQTtJQUMvQyxNQUFNQyxXQUFXLElBQUFSLGNBQUEsR0FBQVMsQ0FBQSxPQUFHLDJCQUEyQkosV0FBVyxZQUFZO0lBQ3RFLE1BQU1LLGFBQWEsSUFBQVYsY0FBQSxHQUFBUyxDQUFBLE9BQUc7TUFDcEJFLEVBQUUsRUFBRU4sV0FBVztNQUFFTyxVQUFVLEVBQUUsd0JBQXdCO01BQUVOLE1BQU07TUFBRUU7SUFDakUsQ0FBQztJQUFDUixjQUFBLEdBQUFTLENBQUE7SUFDRixLQUFLLENBQUNDLGFBQWEsQ0FBQztFQUN0QjtBQUNGIiwiaWdub3JlTGlzdCI6W119