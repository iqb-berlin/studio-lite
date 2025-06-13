function cov_1k0d0iue6i() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/user-id.decorator.ts";
  var hash = "ba7b8a2b1275b4c85540982fbbdc94592a7cb716";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/user-id.decorator.ts",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 22
        },
        end: {
          line: 8,
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
          column: 4
        },
        end: {
          line: 6,
          column: 27
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
            line: 7,
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
    hash: "ba7b8a2b1275b4c85540982fbbdc94592a7cb716"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1k0d0iue6i = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1k0d0iue6i();
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const UserId = (cov_1k0d0iue6i().s[0]++, createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  cov_1k0d0iue6i().f[0]++;
  const request = (cov_1k0d0iue6i().s[1]++, ctx.switchToHttp().getRequest());
  cov_1k0d0iue6i().s[2]++;
  return request.user.id;
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMWswZDBpdWU2aSIsImFjdHVhbENvdmVyYWdlIiwiY3JlYXRlUGFyYW1EZWNvcmF0b3IiLCJFeGVjdXRpb25Db250ZXh0IiwiVXNlcklkIiwicyIsImRhdGEiLCJjdHgiLCJmIiwicmVxdWVzdCIsInN3aXRjaFRvSHR0cCIsImdldFJlcXVlc3QiLCJ1c2VyIiwiaWQiXSwic291cmNlcyI6WyJ1c2VyLWlkLmRlY29yYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVQYXJhbURlY29yYXRvciwgRXhlY3V0aW9uQ29udGV4dCB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IFVzZXJJZCA9IGNyZWF0ZVBhcmFtRGVjb3JhdG9yKFxuICAoZGF0YTogdW5rbm93biwgY3R4OiBFeGVjdXRpb25Db250ZXh0KSA9PiB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGN0eC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCk7XG4gICAgcmV0dXJuIHJlcXVlc3QudXNlci5pZDtcbiAgfVxuKTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsY0FBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsY0FBQTtBQWZaLFNBQVNFLG9CQUFvQixFQUFFQyxnQkFBZ0IsUUFBUSxnQkFBZ0I7QUFFdkUsT0FBTyxNQUFNQyxNQUFNLElBQUFKLGNBQUEsR0FBQUssQ0FBQSxPQUFHSCxvQkFBb0IsQ0FDeEMsQ0FBQ0ksSUFBSSxFQUFFLE9BQU8sRUFBRUMsR0FBRyxFQUFFSixnQkFBZ0IsS0FBSztFQUFBSCxjQUFBLEdBQUFRLENBQUE7RUFDeEMsTUFBTUMsT0FBTyxJQUFBVCxjQUFBLEdBQUFLLENBQUEsT0FBR0UsR0FBRyxDQUFDRyxZQUFZLENBQUMsQ0FBQyxDQUFDQyxVQUFVLENBQUMsQ0FBQztFQUFDWCxjQUFBLEdBQUFLLENBQUE7RUFDaEQsT0FBT0ksT0FBTyxDQUFDRyxJQUFJLENBQUNDLEVBQUU7QUFDeEIsQ0FDRixDQUFDIiwiaWdub3JlTGlzdCI6W119