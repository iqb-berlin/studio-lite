function cov_kawxch9ot() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/user-workspace-group-not-admin.ts";
  var hash = "026833db7e3d43357964a1693a8e806ad7c76c59";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/user-workspace-group-not-admin.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 66
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
            column: 56
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
    hash: "026833db7e3d43357964a1693a8e806ad7c76c59"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_kawxch9ot = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_kawxch9ot();
import { ForbiddenException } from '@nestjs/common';
export class UserWorkspaceGroupNotAdminException extends ForbiddenException {
  constructor(workspaceGroupId: number, method: string) {
    cov_kawxch9ot().f[0]++;
    const description = (cov_kawxch9ot().s[0]++, `User is not admin of ${workspaceGroupId}`);
    const objectOrError = (cov_kawxch9ot().s[1]++, {
      id: workspaceGroupId,
      controller: 'group-admin/workspaces',
      method,
      description
    });
    cov_kawxch9ot().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3Zfa2F3eGNoOW90IiwiYWN0dWFsQ292ZXJhZ2UiLCJGb3JiaWRkZW5FeGNlcHRpb24iLCJVc2VyV29ya3NwYWNlR3JvdXBOb3RBZG1pbkV4Y2VwdGlvbiIsImNvbnN0cnVjdG9yIiwid29ya3NwYWNlR3JvdXBJZCIsIm1ldGhvZCIsImYiLCJkZXNjcmlwdGlvbiIsInMiLCJvYmplY3RPckVycm9yIiwiaWQiLCJjb250cm9sbGVyIl0sInNvdXJjZXMiOlsidXNlci13b3Jrc3BhY2UtZ3JvdXAtbm90LWFkbWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZvcmJpZGRlbkV4Y2VwdGlvbiB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGNsYXNzIFVzZXJXb3Jrc3BhY2VHcm91cE5vdEFkbWluRXhjZXB0aW9uIGV4dGVuZHMgRm9yYmlkZGVuRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3Iod29ya3NwYWNlR3JvdXBJZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZykge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gYFVzZXIgaXMgbm90IGFkbWluIG9mICR7d29ya3NwYWNlR3JvdXBJZH1gO1xuICAgIGNvbnN0IG9iamVjdE9yRXJyb3IgPSB7XG4gICAgICBpZDogd29ya3NwYWNlR3JvdXBJZCwgY29udHJvbGxlcjogJ2dyb3VwLWFkbWluL3dvcmtzcGFjZXMnLCBtZXRob2QsIGRlc2NyaXB0aW9uXG4gICAgfTtcbiAgICBzdXBlcihvYmplY3RPckVycm9yKTtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosU0FBU0Usa0JBQWtCLFFBQVEsZ0JBQWdCO0FBRW5ELE9BQU8sTUFBTUMsbUNBQW1DLFNBQVNELGtCQUFrQixDQUFDO0VBQzFFRSxXQUFXQSxDQUFDQyxnQkFBZ0IsRUFBRSxNQUFNLEVBQUVDLE1BQU0sRUFBRSxNQUFNLEVBQUU7SUFBQU4sYUFBQSxHQUFBTyxDQUFBO0lBQ3BELE1BQU1DLFdBQVcsSUFBQVIsYUFBQSxHQUFBUyxDQUFBLE9BQUcsd0JBQXdCSixnQkFBZ0IsRUFBRTtJQUM5RCxNQUFNSyxhQUFhLElBQUFWLGFBQUEsR0FBQVMsQ0FBQSxPQUFHO01BQ3BCRSxFQUFFLEVBQUVOLGdCQUFnQjtNQUFFTyxVQUFVLEVBQUUsd0JBQXdCO01BQUVOLE1BQU07TUFBRUU7SUFDdEUsQ0FBQztJQUFDUixhQUFBLEdBQUFTLENBQUE7SUFDRixLQUFLLENBQUNDLGFBQWEsQ0FBQztFQUN0QjtBQUNGIiwiaWdub3JlTGlzdCI6W119