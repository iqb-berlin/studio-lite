function cov_27l7yzrwzh() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/resource-package-not-found.exception.ts";
  var hash = "3ed86d6707c8ba260938f0d74370c5899bce8743";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/exceptions/resource-package-not-found.exception.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 24
        },
        end: {
          line: 5,
          column: 65
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
            column: 42
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
    hash: "3ed86d6707c8ba260938f0d74370c5899bce8743"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_27l7yzrwzh = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_27l7yzrwzh();
import { NotFoundException } from '@nestjs/common';
export class ResourcePackageNotFoundException extends NotFoundException {
  constructor(id: number, method: string) {
    cov_27l7yzrwzh().f[0]++;
    const description = (cov_27l7yzrwzh().s[0]++, `ResourcePackage with id ${id} not found`);
    const objectOrError = (cov_27l7yzrwzh().s[1]++, {
      id: id,
      controller: 'workspace/:workspace_id',
      method,
      description
    });
    cov_27l7yzrwzh().s[2]++;
    super(objectOrError);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMjdsN3l6cnd6aCIsImFjdHVhbENvdmVyYWdlIiwiTm90Rm91bmRFeGNlcHRpb24iLCJSZXNvdXJjZVBhY2thZ2VOb3RGb3VuZEV4Y2VwdGlvbiIsImNvbnN0cnVjdG9yIiwiaWQiLCJtZXRob2QiLCJmIiwiZGVzY3JpcHRpb24iLCJzIiwib2JqZWN0T3JFcnJvciIsImNvbnRyb2xsZXIiXSwic291cmNlcyI6WyJyZXNvdXJjZS1wYWNrYWdlLW5vdC1mb3VuZC5leGNlcHRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90Rm91bmRFeGNlcHRpb24gfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbmV4cG9ydCBjbGFzcyBSZXNvdXJjZVBhY2thZ2VOb3RGb3VuZEV4Y2VwdGlvbiBleHRlbmRzIE5vdEZvdW5kRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoaWQ6IG51bWJlciwgbWV0aG9kOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGBSZXNvdXJjZVBhY2thZ2Ugd2l0aCBpZCAke2lkfSBub3QgZm91bmRgO1xuICAgIGNvbnN0IG9iamVjdE9yRXJyb3IgPSB7XG4gICAgICBpZDogaWQsIGNvbnRyb2xsZXI6ICd3b3Jrc3BhY2UvOndvcmtzcGFjZV9pZCcsIG1ldGhvZCwgZGVzY3JpcHRpb25cbiAgICB9O1xuICAgIHN1cGVyKG9iamVjdE9yRXJyb3IpO1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVZO0lBQUFBLGNBQUEsWUFBQUEsQ0FBQTtNQUFBLE9BQUFDLGNBQUE7SUFBQTtFQUFBO0VBQUEsT0FBQUEsY0FBQTtBQUFBO0FBQUFELGNBQUE7QUFmWixTQUFTRSxpQkFBaUIsUUFBUSxnQkFBZ0I7QUFFbEQsT0FBTyxNQUFNQyxnQ0FBZ0MsU0FBU0QsaUJBQWlCLENBQUM7RUFDdEVFLFdBQVdBLENBQUNDLEVBQUUsRUFBRSxNQUFNLEVBQUVDLE1BQU0sRUFBRSxNQUFNLEVBQUU7SUFBQU4sY0FBQSxHQUFBTyxDQUFBO0lBQ3RDLE1BQU1DLFdBQVcsSUFBQVIsY0FBQSxHQUFBUyxDQUFBLE9BQUcsMkJBQTJCSixFQUFFLFlBQVk7SUFDN0QsTUFBTUssYUFBYSxJQUFBVixjQUFBLEdBQUFTLENBQUEsT0FBRztNQUNwQkosRUFBRSxFQUFFQSxFQUFFO01BQUVNLFVBQVUsRUFBRSx5QkFBeUI7TUFBRUwsTUFBTTtNQUFFRTtJQUN6RCxDQUFDO0lBQUNSLGNBQUEsR0FBQVMsQ0FBQTtJQUNGLEtBQUssQ0FBQ0MsYUFBYSxDQUFDO0VBQ3RCO0FBQ0YiLCJpZ25vcmVMaXN0IjpbXX0=