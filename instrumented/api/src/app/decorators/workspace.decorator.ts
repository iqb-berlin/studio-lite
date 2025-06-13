function cov_1kvamzygnu() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/workspace.decorator.ts";
  var hash = "5b568a0692afd3c3cbbed84ef433100541eea8a3";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/workspace.decorator.ts",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 27
        },
        end: {
          line: 9,
          column: 1
        }
      },
      "1": {
        start: {
          line: 5,
          column: 20
        },
        end: {
          line: 5,
          column: 51
        }
      },
      "2": {
        start: {
          line: 6,
          column: 19
        },
        end: {
          line: 6,
          column: 33
        }
      },
      "3": {
        start: {
          line: 7,
          column: 4
        },
        end: {
          line: 7,
          column: 31
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
            column: 44
          },
          end: {
            line: 8,
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
      "2": 0,
      "3": 0
    },
    f: {
      "0": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "5b568a0692afd3c3cbbed84ef433100541eea8a3"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1kvamzygnu = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1kvamzygnu();
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const WorkspaceId = (cov_1kvamzygnu().s[0]++, createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  cov_1kvamzygnu().f[0]++;
  const request = (cov_1kvamzygnu().s[1]++, ctx.switchToHttp().getRequest());
  const params = (cov_1kvamzygnu().s[2]++, request.params);
  cov_1kvamzygnu().s[3]++;
  return params.workspace_id;
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMWt2YW16eWdudSIsImFjdHVhbENvdmVyYWdlIiwiY3JlYXRlUGFyYW1EZWNvcmF0b3IiLCJFeGVjdXRpb25Db250ZXh0IiwiV29ya3NwYWNlSWQiLCJzIiwiZGF0YSIsImN0eCIsImYiLCJyZXF1ZXN0Iiwic3dpdGNoVG9IdHRwIiwiZ2V0UmVxdWVzdCIsInBhcmFtcyIsIndvcmtzcGFjZV9pZCJdLCJzb3VyY2VzIjpbIndvcmtzcGFjZS5kZWNvcmF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlUGFyYW1EZWNvcmF0b3IsIEV4ZWN1dGlvbkNvbnRleHQgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbmV4cG9ydCBjb25zdCBXb3Jrc3BhY2VJZCA9IGNyZWF0ZVBhcmFtRGVjb3JhdG9yKFxuICAoZGF0YTogdW5rbm93biwgY3R4OiBFeGVjdXRpb25Db250ZXh0KSA9PiB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGN0eC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCk7XG4gICAgY29uc3QgcGFyYW1zID0gcmVxdWVzdC5wYXJhbXM7XG4gICAgcmV0dXJuIHBhcmFtcy53b3Jrc3BhY2VfaWQ7XG4gIH1cbik7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsY0FBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsY0FBQTtBQWZaLFNBQVNFLG9CQUFvQixFQUFFQyxnQkFBZ0IsUUFBUSxnQkFBZ0I7QUFFdkUsT0FBTyxNQUFNQyxXQUFXLElBQUFKLGNBQUEsR0FBQUssQ0FBQSxPQUFHSCxvQkFBb0IsQ0FDN0MsQ0FBQ0ksSUFBSSxFQUFFLE9BQU8sRUFBRUMsR0FBRyxFQUFFSixnQkFBZ0IsS0FBSztFQUFBSCxjQUFBLEdBQUFRLENBQUE7RUFDeEMsTUFBTUMsT0FBTyxJQUFBVCxjQUFBLEdBQUFLLENBQUEsT0FBR0UsR0FBRyxDQUFDRyxZQUFZLENBQUMsQ0FBQyxDQUFDQyxVQUFVLENBQUMsQ0FBQztFQUMvQyxNQUFNQyxNQUFNLElBQUFaLGNBQUEsR0FBQUssQ0FBQSxPQUFHSSxPQUFPLENBQUNHLE1BQU07RUFBQ1osY0FBQSxHQUFBSyxDQUFBO0VBQzlCLE9BQU9PLE1BQU0sQ0FBQ0MsWUFBWTtBQUM1QixDQUNGLENBQUMiLCJpZ25vcmVMaXN0IjpbXX0=