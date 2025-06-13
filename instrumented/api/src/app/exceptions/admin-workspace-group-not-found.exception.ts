function cov_10oyef29r8() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/admin-workspace-group-not-found.exception.ts";
  var hash = "ab2d5be7bb5ab19030f4fb26a39b0133f3caeb18";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/admin-workspace-group-not-found.exception.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 80
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
    hash: "ab2d5be7bb5ab19030f4fb26a39b0133f3caeb18"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_10oyef29r8 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_10oyef29r8();
import { NotFoundException } from '@nestjs/common';
export class AdminWorkspaceGroupNotFoundException extends NotFoundException {
  constructor(workspaceId: number, method: string) {
    cov_10oyef29r8().f[0]++;
    const description = (cov_10oyef29r8().s[0]++, `Admin workspace group with id ${workspaceId} not found`);
    const objectOrError = (cov_10oyef29r8().s[1]++, {
      id: workspaceId,
      controller: 'group-admin/workspaces',
      method,
      description
    });
    cov_10oyef29r8().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMTBveWVmMjlyOCIsImFjdHVhbENvdmVyYWdlIiwiTm90Rm91bmRFeGNlcHRpb24iLCJBZG1pbldvcmtzcGFjZUdyb3VwTm90Rm91bmRFeGNlcHRpb24iLCJjb25zdHJ1Y3RvciIsIndvcmtzcGFjZUlkIiwibWV0aG9kIiwiZiIsImRlc2NyaXB0aW9uIiwicyIsIm9iamVjdE9yRXJyb3IiLCJpZCIsImNvbnRyb2xsZXIiXSwic291cmNlcyI6WyJhZG1pbi13b3Jrc3BhY2UtZ3JvdXAtbm90LWZvdW5kLmV4Y2VwdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOb3RGb3VuZEV4Y2VwdGlvbiB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGNsYXNzIEFkbWluV29ya3NwYWNlR3JvdXBOb3RGb3VuZEV4Y2VwdGlvbiBleHRlbmRzIE5vdEZvdW5kRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3Iod29ya3NwYWNlSWQ6IG51bWJlciwgbWV0aG9kOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGBBZG1pbiB3b3Jrc3BhY2UgZ3JvdXAgd2l0aCBpZCAke3dvcmtzcGFjZUlkfSBub3QgZm91bmRgO1xuICAgIGNvbnN0IG9iamVjdE9yRXJyb3IgPSB7XG4gICAgICBpZDogd29ya3NwYWNlSWQsIGNvbnRyb2xsZXI6ICdncm91cC1hZG1pbi93b3Jrc3BhY2VzJywgbWV0aG9kLCBkZXNjcmlwdGlvblxuICAgIH07XG4gICAgc3VwZXIob2JqZWN0T3JFcnJvcik7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsY0FBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsY0FBQTtBQWZaLFNBQVNFLGlCQUFpQixRQUFRLGdCQUFnQjtBQUVsRCxPQUFPLE1BQU1DLG9DQUFvQyxTQUFTRCxpQkFBaUIsQ0FBQztFQUMxRUUsV0FBV0EsQ0FBQ0MsV0FBVyxFQUFFLE1BQU0sRUFBRUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtJQUFBTixjQUFBLEdBQUFPLENBQUE7SUFDL0MsTUFBTUMsV0FBVyxJQUFBUixjQUFBLEdBQUFTLENBQUEsT0FBRyxpQ0FBaUNKLFdBQVcsWUFBWTtJQUM1RSxNQUFNSyxhQUFhLElBQUFWLGNBQUEsR0FBQVMsQ0FBQSxPQUFHO01BQ3BCRSxFQUFFLEVBQUVOLFdBQVc7TUFBRU8sVUFBVSxFQUFFLHdCQUF3QjtNQUFFTixNQUFNO01BQUVFO0lBQ2pFLENBQUM7SUFBQ1IsY0FBQSxHQUFBUyxDQUFBO0lBQ0YsS0FBSyxDQUFDQyxhQUFhLENBQUM7RUFDdEI7QUFDRiIsImlnbm9yZUxpc3QiOltdfQ==