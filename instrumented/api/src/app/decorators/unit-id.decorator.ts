function cov_1zi1nibk46() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/unit-id.decorator.ts";
  var hash = "1cde319e282fef48e103b8ec0ea23cb3169193f7";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/unit-id.decorator.ts",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 22
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
          column: 26
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
    hash: "1cde319e282fef48e103b8ec0ea23cb3169193f7"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1zi1nibk46 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1zi1nibk46();
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const UnitId = (cov_1zi1nibk46().s[0]++, createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  cov_1zi1nibk46().f[0]++;
  const request = (cov_1zi1nibk46().s[1]++, ctx.switchToHttp().getRequest());
  const params = (cov_1zi1nibk46().s[2]++, request.params);
  cov_1zi1nibk46().s[3]++;
  return params.unit_id;
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMXppMW5pYms0NiIsImFjdHVhbENvdmVyYWdlIiwiY3JlYXRlUGFyYW1EZWNvcmF0b3IiLCJFeGVjdXRpb25Db250ZXh0IiwiVW5pdElkIiwicyIsImRhdGEiLCJjdHgiLCJmIiwicmVxdWVzdCIsInN3aXRjaFRvSHR0cCIsImdldFJlcXVlc3QiLCJwYXJhbXMiLCJ1bml0X2lkIl0sInNvdXJjZXMiOlsidW5pdC1pZC5kZWNvcmF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlUGFyYW1EZWNvcmF0b3IsIEV4ZWN1dGlvbkNvbnRleHQgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5cbmV4cG9ydCBjb25zdCBVbml0SWQgPSBjcmVhdGVQYXJhbURlY29yYXRvcihcbiAgKGRhdGE6IHVua25vd24sIGN0eDogRXhlY3V0aW9uQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBjdHguc3dpdGNoVG9IdHRwKCkuZ2V0UmVxdWVzdCgpO1xuICAgIGNvbnN0IHBhcmFtcyA9IHJlcXVlc3QucGFyYW1zO1xuICAgIHJldHVybiBwYXJhbXMudW5pdF9pZDtcbiAgfVxuKTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxjQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxjQUFBO0FBZlosU0FBU0Usb0JBQW9CLEVBQUVDLGdCQUFnQixRQUFRLGdCQUFnQjtBQUV2RSxPQUFPLE1BQU1DLE1BQU0sSUFBQUosY0FBQSxHQUFBSyxDQUFBLE9BQUdILG9CQUFvQixDQUN4QyxDQUFDSSxJQUFJLEVBQUUsT0FBTyxFQUFFQyxHQUFHLEVBQUVKLGdCQUFnQixLQUFLO0VBQUFILGNBQUEsR0FBQVEsQ0FBQTtFQUN4QyxNQUFNQyxPQUFPLElBQUFULGNBQUEsR0FBQUssQ0FBQSxPQUFHRSxHQUFHLENBQUNHLFlBQVksQ0FBQyxDQUFDLENBQUNDLFVBQVUsQ0FBQyxDQUFDO0VBQy9DLE1BQU1DLE1BQU0sSUFBQVosY0FBQSxHQUFBSyxDQUFBLE9BQUdJLE9BQU8sQ0FBQ0csTUFBTTtFQUFDWixjQUFBLEdBQUFLLENBQUE7RUFDOUIsT0FBT08sTUFBTSxDQUFDQyxPQUFPO0FBQ3ZCLENBQ0YsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==