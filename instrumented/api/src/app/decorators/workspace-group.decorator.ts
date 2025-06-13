function cov_1t9nf210e8() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/workspace-group.decorator.ts";
  var hash = "224a7aa813626aff335b814808a67f152efeb3a8";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/workspace-group.decorator.ts",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 32
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
          column: 51
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
    hash: "224a7aa813626aff335b814808a67f152efeb3a8"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1t9nf210e8 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1t9nf210e8();
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const WorkspaceGroupId = (cov_1t9nf210e8().s[0]++, createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  cov_1t9nf210e8().f[0]++;
  const request = (cov_1t9nf210e8().s[1]++, ctx.switchToHttp().getRequest());
  const params = (cov_1t9nf210e8().s[2]++, request.params);
  cov_1t9nf210e8().s[3]++;
  return parseInt(params.workspace_group_id, 10);
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXQ5bmYyMTBlOCIsImFjdHVhbENvdmVyYWdlIiwiY3JlYXRlUGFyYW1EZWNvcmF0b3IiLCJFeGVjdXRpb25Db250ZXh0IiwiV29ya3NwYWNlR3JvdXBJZCIsInMiLCJkYXRhIiwiY3R4IiwiZiIsInJlcXVlc3QiLCJzd2l0Y2hUb0h0dHAiLCJnZXRSZXF1ZXN0IiwicGFyYW1zIiwicGFyc2VJbnQiLCJ3b3Jrc3BhY2VfZ3JvdXBfaWQiXSwic291cmNlcyI6WyJ3b3Jrc3BhY2UtZ3JvdXAuZGVjb3JhdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZVBhcmFtRGVjb3JhdG9yLCBFeGVjdXRpb25Db250ZXh0IH0gZnJvbSAnQG5lc3Rqcy9jb21tb24nO1xuXG5leHBvcnQgY29uc3QgV29ya3NwYWNlR3JvdXBJZCA9IGNyZWF0ZVBhcmFtRGVjb3JhdG9yKFxuICAoZGF0YTogdW5rbm93biwgY3R4OiBFeGVjdXRpb25Db250ZXh0KSA9PiB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGN0eC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCk7XG4gICAgY29uc3QgcGFyYW1zID0gcmVxdWVzdC5wYXJhbXM7XG4gICAgcmV0dXJuIHBhcnNlSW50KHBhcmFtcy53b3Jrc3BhY2VfZ3JvdXBfaWQsIDEwKTtcbiAgfVxuKTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxjQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxjQUFBO0FBZlosU0FBU0Usb0JBQW9CLEVBQUVDLGdCQUFnQixRQUFRLGdCQUFnQjtBQUV2RSxPQUFPLE1BQU1DLGdCQUFnQixJQUFBSixjQUFBLEdBQUFLLENBQUEsT0FBR0gsb0JBQW9CLENBQ2xELENBQUNJLElBQUksRUFBRSxPQUFPLEVBQUVDLEdBQUcsRUFBRUosZ0JBQWdCLEtBQUs7RUFBQUgsY0FBQSxHQUFBUSxDQUFBO0VBQ3hDLE1BQU1DLE9BQU8sSUFBQVQsY0FBQSxHQUFBSyxDQUFBLE9BQUdFLEdBQUcsQ0FBQ0csWUFBWSxDQUFDLENBQUMsQ0FBQ0MsVUFBVSxDQUFDLENBQUM7RUFDL0MsTUFBTUMsTUFBTSxJQUFBWixjQUFBLEdBQUFLLENBQUEsT0FBR0ksT0FBTyxDQUFDRyxNQUFNO0VBQUNaLGNBQUEsR0FBQUssQ0FBQTtFQUM5QixPQUFPUSxRQUFRLENBQUNELE1BQU0sQ0FBQ0Usa0JBQWtCLEVBQUUsRUFBRSxDQUFDO0FBQ2hELENBQ0YsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==