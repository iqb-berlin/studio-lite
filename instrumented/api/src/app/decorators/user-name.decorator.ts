function cov_21xkei0oy7() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/user-name.decorator.ts";
  var hash = "c8e8d45d8db9f389b7aaed5f02773fb6b00cc87d";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/user-name.decorator.ts",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 24
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
          column: 29
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
    hash: "c8e8d45d8db9f389b7aaed5f02773fb6b00cc87d"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_21xkei0oy7 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_21xkei0oy7();
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const UserName = (cov_21xkei0oy7().s[0]++, createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  cov_21xkei0oy7().f[0]++;
  const request = (cov_21xkei0oy7().s[1]++, ctx.switchToHttp().getRequest());
  cov_21xkei0oy7().s[2]++;
  return request.user.name;
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMjF4a2VpMG95NyIsImFjdHVhbENvdmVyYWdlIiwiY3JlYXRlUGFyYW1EZWNvcmF0b3IiLCJFeGVjdXRpb25Db250ZXh0IiwiVXNlck5hbWUiLCJzIiwiZGF0YSIsImN0eCIsImYiLCJyZXF1ZXN0Iiwic3dpdGNoVG9IdHRwIiwiZ2V0UmVxdWVzdCIsInVzZXIiLCJuYW1lIl0sInNvdXJjZXMiOlsidXNlci1uYW1lLmRlY29yYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVQYXJhbURlY29yYXRvciwgRXhlY3V0aW9uQ29udGV4dCB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IFVzZXJOYW1lID0gY3JlYXRlUGFyYW1EZWNvcmF0b3IoXG4gIChkYXRhOiB1bmtub3duLCBjdHg6IEV4ZWN1dGlvbkNvbnRleHQpID0+IHtcbiAgICBjb25zdCByZXF1ZXN0ID0gY3R4LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICByZXR1cm4gcmVxdWVzdC51c2VyLm5hbWU7XG4gIH1cbik7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVZO0lBQUFBLGNBQUEsWUFBQUEsQ0FBQTtNQUFBLE9BQUFDLGNBQUE7SUFBQTtFQUFBO0VBQUEsT0FBQUEsY0FBQTtBQUFBO0FBQUFELGNBQUE7QUFmWixTQUFTRSxvQkFBb0IsRUFBRUMsZ0JBQWdCLFFBQVEsZ0JBQWdCO0FBRXZFLE9BQU8sTUFBTUMsUUFBUSxJQUFBSixjQUFBLEdBQUFLLENBQUEsT0FBR0gsb0JBQW9CLENBQzFDLENBQUNJLElBQUksRUFBRSxPQUFPLEVBQUVDLEdBQUcsRUFBRUosZ0JBQWdCLEtBQUs7RUFBQUgsY0FBQSxHQUFBUSxDQUFBO0VBQ3hDLE1BQU1DLE9BQU8sSUFBQVQsY0FBQSxHQUFBSyxDQUFBLE9BQUdFLEdBQUcsQ0FBQ0csWUFBWSxDQUFDLENBQUMsQ0FBQ0MsVUFBVSxDQUFDLENBQUM7RUFBQ1gsY0FBQSxHQUFBSyxDQUFBO0VBQ2hELE9BQU9JLE9BQU8sQ0FBQ0csSUFBSSxDQUFDQyxJQUFJO0FBQzFCLENBQ0YsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==