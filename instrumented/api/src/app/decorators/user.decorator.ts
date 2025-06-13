function cov_5r4meb9lq() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/user.decorator.ts";
  var hash = "f8c31699c4973ada7ca59ab99230667874024cef";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/user.decorator.ts",
    statementMap: {
      "0": {
        start: {
          line: 4,
          column: 20
        },
        end: {
          line: 9,
          column: 1
        }
      },
      "1": {
        start: {
          line: 6,
          column: 20
        },
        end: {
          line: 6,
          column: 51
        }
      },
      "2": {
        start: {
          line: 7,
          column: 4
        },
        end: {
          line: 7,
          column: 38
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 5,
            column: 2
          },
          end: {
            line: 5,
            column: 3
          }
        },
        loc: {
          start: {
            line: 5,
            column: 44
          },
          end: {
            line: 8,
            column: 3
          }
        },
        line: 5
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
    hash: "f8c31699c4973ada7ca59ab99230667874024cef"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_5r4meb9lq = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_5r4meb9lq();
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import UserEntity from '../entities/user.entity';
export const User = (cov_5r4meb9lq().s[0]++, createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  cov_5r4meb9lq().f[0]++;
  const request = (cov_5r4meb9lq().s[1]++, ctx.switchToHttp().getRequest());
  cov_5r4meb9lq().s[2]++;
  return request.user as UserEntity;
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfNXI0bWViOWxxIiwiYWN0dWFsQ292ZXJhZ2UiLCJjcmVhdGVQYXJhbURlY29yYXRvciIsIkV4ZWN1dGlvbkNvbnRleHQiLCJVc2VyRW50aXR5IiwiVXNlciIsInMiLCJkYXRhIiwiY3R4IiwiZiIsInJlcXVlc3QiLCJzd2l0Y2hUb0h0dHAiLCJnZXRSZXF1ZXN0IiwidXNlciJdLCJzb3VyY2VzIjpbInVzZXIuZGVjb3JhdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZVBhcmFtRGVjb3JhdG9yLCBFeGVjdXRpb25Db250ZXh0IH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuaW1wb3J0IFVzZXJFbnRpdHkgZnJvbSAnLi4vZW50aXRpZXMvdXNlci5lbnRpdHknO1xuXG5leHBvcnQgY29uc3QgVXNlciA9IGNyZWF0ZVBhcmFtRGVjb3JhdG9yKFxuICAoZGF0YTogdW5rbm93biwgY3R4OiBFeGVjdXRpb25Db250ZXh0KSA9PiB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGN0eC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCk7XG4gICAgcmV0dXJuIHJlcXVlc3QudXNlciBhcyBVc2VyRW50aXR5O1xuICB9XG4pO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosU0FBU0Usb0JBQW9CLEVBQUVDLGdCQUFnQixRQUFRLGdCQUFnQjtBQUN2RSxPQUFPQyxVQUFVLE1BQU0seUJBQXlCO0FBRWhELE9BQU8sTUFBTUMsSUFBSSxJQUFBTCxhQUFBLEdBQUFNLENBQUEsT0FBR0osb0JBQW9CLENBQ3RDLENBQUNLLElBQUksRUFBRSxPQUFPLEVBQUVDLEdBQUcsRUFBRUwsZ0JBQWdCLEtBQUs7RUFBQUgsYUFBQSxHQUFBUyxDQUFBO0VBQ3hDLE1BQU1DLE9BQU8sSUFBQVYsYUFBQSxHQUFBTSxDQUFBLE9BQUdFLEdBQUcsQ0FBQ0csWUFBWSxDQUFDLENBQUMsQ0FBQ0MsVUFBVSxDQUFDLENBQUM7RUFBQ1osYUFBQSxHQUFBTSxDQUFBO0VBQ2hELE9BQU9JLE9BQU8sQ0FBQ0csSUFBSSxJQUFJVCxVQUFVO0FBQ25DLENBQ0YsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==