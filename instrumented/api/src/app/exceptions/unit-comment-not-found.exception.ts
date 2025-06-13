function cov_fbforsu4j() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/unit-comment-not-found.exception.ts";
  var hash = "3b14e03a537d4ca94be8e5de0adb6e7cfc4bde10";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/unit-comment-not-found.exception.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 68
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
            column: 49
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
    hash: "3b14e03a537d4ca94be8e5de0adb6e7cfc4bde10"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_fbforsu4j = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_fbforsu4j();
import { NotFoundException } from '@nestjs/common';
export class UnitCommentNotFoundException extends NotFoundException {
  constructor(commentId: number, method: string) {
    cov_fbforsu4j().f[0]++;
    const description = (cov_fbforsu4j().s[0]++, `UnitComment with id ${commentId} not found`);
    const objectOrError = (cov_fbforsu4j().s[1]++, {
      id: commentId,
      controller: 'admin/resourcePackage',
      method,
      description
    });
    cov_fbforsu4j().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfZmJmb3JzdTRqIiwiYWN0dWFsQ292ZXJhZ2UiLCJOb3RGb3VuZEV4Y2VwdGlvbiIsIlVuaXRDb21tZW50Tm90Rm91bmRFeGNlcHRpb24iLCJjb25zdHJ1Y3RvciIsImNvbW1lbnRJZCIsIm1ldGhvZCIsImYiLCJkZXNjcmlwdGlvbiIsInMiLCJvYmplY3RPckVycm9yIiwiaWQiLCJjb250cm9sbGVyIl0sInNvdXJjZXMiOlsidW5pdC1jb21tZW50LW5vdC1mb3VuZC5leGNlcHRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90Rm91bmRFeGNlcHRpb24gfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbmV4cG9ydCBjbGFzcyBVbml0Q29tbWVudE5vdEZvdW5kRXhjZXB0aW9uIGV4dGVuZHMgTm90Rm91bmRFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcihjb21tZW50SWQ6IG51bWJlciwgbWV0aG9kOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGBVbml0Q29tbWVudCB3aXRoIGlkICR7Y29tbWVudElkfSBub3QgZm91bmRgO1xuICAgIGNvbnN0IG9iamVjdE9yRXJyb3IgPSB7XG4gICAgICBpZDogY29tbWVudElkLCBjb250cm9sbGVyOiAnYWRtaW4vcmVzb3VyY2VQYWNrYWdlJywgbWV0aG9kLCBkZXNjcmlwdGlvblxuICAgIH07XG4gICAgc3VwZXIob2JqZWN0T3JFcnJvcik7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsYUFBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsYUFBQTtBQWZaLFNBQVNFLGlCQUFpQixRQUFRLGdCQUFnQjtBQUVsRCxPQUFPLE1BQU1DLDRCQUE0QixTQUFTRCxpQkFBaUIsQ0FBQztFQUNsRUUsV0FBV0EsQ0FBQ0MsU0FBUyxFQUFFLE1BQU0sRUFBRUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtJQUFBTixhQUFBLEdBQUFPLENBQUE7SUFDN0MsTUFBTUMsV0FBVyxJQUFBUixhQUFBLEdBQUFTLENBQUEsT0FBRyx1QkFBdUJKLFNBQVMsWUFBWTtJQUNoRSxNQUFNSyxhQUFhLElBQUFWLGFBQUEsR0FBQVMsQ0FBQSxPQUFHO01BQ3BCRSxFQUFFLEVBQUVOLFNBQVM7TUFBRU8sVUFBVSxFQUFFLHVCQUF1QjtNQUFFTixNQUFNO01BQUVFO0lBQzlELENBQUM7SUFBQ1IsYUFBQSxHQUFBUyxDQUFBO0lBQ0YsS0FBSyxDQUFDQyxhQUFhLENBQUM7RUFDdEI7QUFDRiIsImlnbm9yZUxpc3QiOltdfQ==