function cov_1ckfspdkda() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/unit-not-found.exception.ts";
  var hash = "04ce119e47d10e9a3bd3e2a902cd10ec1acf32dc";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/unit-not-found.exception.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 94
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
            column: 67
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
    hash: "04ce119e47d10e9a3bd3e2a902cd10ec1acf32dc"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1ckfspdkda = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1ckfspdkda();
import { NotFoundException } from '@nestjs/common';
export class UnitNotFoundException extends NotFoundException {
  constructor(unitId: number, workspaceId: number, method: string) {
    cov_1ckfspdkda().f[0]++;
    const description = (cov_1ckfspdkda().s[0]++, `Unit with id ${unitId} not found in workspace with id ${workspaceId}`);
    const objectOrError = (cov_1ckfspdkda().s[1]++, {
      id: unitId,
      controller: 'workspace-unit',
      method,
      description
    });
    cov_1ckfspdkda().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMWNrZnNwZGtkYSIsImFjdHVhbENvdmVyYWdlIiwiTm90Rm91bmRFeGNlcHRpb24iLCJVbml0Tm90Rm91bmRFeGNlcHRpb24iLCJjb25zdHJ1Y3RvciIsInVuaXRJZCIsIndvcmtzcGFjZUlkIiwibWV0aG9kIiwiZiIsImRlc2NyaXB0aW9uIiwicyIsIm9iamVjdE9yRXJyb3IiLCJpZCIsImNvbnRyb2xsZXIiXSwic291cmNlcyI6WyJ1bml0LW5vdC1mb3VuZC5leGNlcHRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90Rm91bmRFeGNlcHRpb24gfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbmV4cG9ydCBjbGFzcyBVbml0Tm90Rm91bmRFeGNlcHRpb24gZXh0ZW5kcyBOb3RGb3VuZEV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHVuaXRJZDogbnVtYmVyLCB3b3Jrc3BhY2VJZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZykge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gYFVuaXQgd2l0aCBpZCAke3VuaXRJZH0gbm90IGZvdW5kIGluIHdvcmtzcGFjZSB3aXRoIGlkICR7d29ya3NwYWNlSWR9YDtcbiAgICBjb25zdCBvYmplY3RPckVycm9yID0ge1xuICAgICAgaWQ6IHVuaXRJZCwgY29udHJvbGxlcjogJ3dvcmtzcGFjZS11bml0JywgbWV0aG9kLCBkZXNjcmlwdGlvblxuICAgIH07XG4gICAgc3VwZXIob2JqZWN0T3JFcnJvcik7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsY0FBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsY0FBQTtBQWZaLFNBQVNFLGlCQUFpQixRQUFRLGdCQUFnQjtBQUVsRCxPQUFPLE1BQU1DLHFCQUFxQixTQUFTRCxpQkFBaUIsQ0FBQztFQUMzREUsV0FBV0EsQ0FBQ0MsTUFBTSxFQUFFLE1BQU0sRUFBRUMsV0FBVyxFQUFFLE1BQU0sRUFBRUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtJQUFBUCxjQUFBLEdBQUFRLENBQUE7SUFDL0QsTUFBTUMsV0FBVyxJQUFBVCxjQUFBLEdBQUFVLENBQUEsT0FBRyxnQkFBZ0JMLE1BQU0sbUNBQW1DQyxXQUFXLEVBQUU7SUFDMUYsTUFBTUssYUFBYSxJQUFBWCxjQUFBLEdBQUFVLENBQUEsT0FBRztNQUNwQkUsRUFBRSxFQUFFUCxNQUFNO01BQUVRLFVBQVUsRUFBRSxnQkFBZ0I7TUFBRU4sTUFBTTtNQUFFRTtJQUNwRCxDQUFDO0lBQUNULGNBQUEsR0FBQVUsQ0FBQTtJQUNGLEtBQUssQ0FBQ0MsYUFBYSxDQUFDO0VBQ3RCO0FBQ0YiLCJpZ25vcmVMaXN0IjpbXX0=