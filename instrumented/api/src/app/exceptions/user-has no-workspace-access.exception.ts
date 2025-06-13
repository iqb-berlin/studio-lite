function cov_1thw3ez9a7() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/user-has no-workspace-access.exception.ts";
  var hash = "56323ac06a673d2e4bbb51442d56292253ea18c0";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/user-has no-workspace-access.exception.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 84
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
    hash: "56323ac06a673d2e4bbb51442d56292253ea18c0"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1thw3ez9a7 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1thw3ez9a7();
import { ForbiddenException } from '@nestjs/common';
export class UserHasNoWorkspaceAccessException extends ForbiddenException {
  constructor(workspaceId: number, method: string) {
    cov_1thw3ez9a7().f[0]++;
    const description = (cov_1thw3ez9a7().s[0]++, `User does not have permission for workspace ${workspaceId}`);
    const objectOrError = (cov_1thw3ez9a7().s[1]++, {
      id: workspaceId,
      controller: 'workspaces',
      method,
      description
    });
    cov_1thw3ez9a7().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXRodzNlejlhNyIsImFjdHVhbENvdmVyYWdlIiwiRm9yYmlkZGVuRXhjZXB0aW9uIiwiVXNlckhhc05vV29ya3NwYWNlQWNjZXNzRXhjZXB0aW9uIiwiY29uc3RydWN0b3IiLCJ3b3Jrc3BhY2VJZCIsIm1ldGhvZCIsImYiLCJkZXNjcmlwdGlvbiIsInMiLCJvYmplY3RPckVycm9yIiwiaWQiLCJjb250cm9sbGVyIl0sInNvdXJjZXMiOlsidXNlci1oYXMgbm8td29ya3NwYWNlLWFjY2Vzcy5leGNlcHRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRm9yYmlkZGVuRXhjZXB0aW9uIH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuXG5leHBvcnQgY2xhc3MgVXNlckhhc05vV29ya3NwYWNlQWNjZXNzRXhjZXB0aW9uIGV4dGVuZHMgRm9yYmlkZGVuRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3Iod29ya3NwYWNlSWQ6IG51bWJlciwgbWV0aG9kOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGBVc2VyIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbiBmb3Igd29ya3NwYWNlICR7d29ya3NwYWNlSWR9YDtcbiAgICBjb25zdCBvYmplY3RPckVycm9yID0ge1xuICAgICAgaWQ6IHdvcmtzcGFjZUlkLCBjb250cm9sbGVyOiAnd29ya3NwYWNlcycsIG1ldGhvZCwgZGVzY3JpcHRpb25cbiAgICB9O1xuICAgIHN1cGVyKG9iamVjdE9yRXJyb3IpO1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVZO0lBQUFBLGNBQUEsWUFBQUEsQ0FBQTtNQUFBLE9BQUFDLGNBQUE7SUFBQTtFQUFBO0VBQUEsT0FBQUEsY0FBQTtBQUFBO0FBQUFELGNBQUE7QUFmWixTQUFTRSxrQkFBa0IsUUFBUSxnQkFBZ0I7QUFFbkQsT0FBTyxNQUFNQyxpQ0FBaUMsU0FBU0Qsa0JBQWtCLENBQUM7RUFDeEVFLFdBQVdBLENBQUNDLFdBQVcsRUFBRSxNQUFNLEVBQUVDLE1BQU0sRUFBRSxNQUFNLEVBQUU7SUFBQU4sY0FBQSxHQUFBTyxDQUFBO0lBQy9DLE1BQU1DLFdBQVcsSUFBQVIsY0FBQSxHQUFBUyxDQUFBLE9BQUcsK0NBQStDSixXQUFXLEVBQUU7SUFDaEYsTUFBTUssYUFBYSxJQUFBVixjQUFBLEdBQUFTLENBQUEsT0FBRztNQUNwQkUsRUFBRSxFQUFFTixXQUFXO01BQUVPLFVBQVUsRUFBRSxZQUFZO01BQUVOLE1BQU07TUFBRUU7SUFDckQsQ0FBQztJQUFDUixjQUFBLEdBQUFTLENBQUE7SUFDRixLQUFLLENBQUNDLGFBQWEsQ0FBQztFQUN0QjtBQUNGIiwiaWdub3JlTGlzdCI6W119