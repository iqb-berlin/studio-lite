function cov_27w5obuyrh() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/wsg-admin/models/workspace-checked.class.ts";
  var hash = "90549c45169858f251f769a41262ff127035628d";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/wsg-admin/models/workspace-checked.class.ts",
    statementMap: {
      "0": {
        start: {
          line: 10,
          column: 4
        },
        end: {
          line: 10,
          column: 30
        }
      },
      "1": {
        start: {
          line: 11,
          column: 4
        },
        end: {
          line: 11,
          column: 34
        }
      },
      "2": {
        start: {
          line: 12,
          column: 4
        },
        end: {
          line: 12,
          column: 27
        }
      },
      "3": {
        start: {
          line: 13,
          column: 4
        },
        end: {
          line: 13,
          column: 25
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 9,
            column: 2
          },
          end: {
            line: 9,
            column: 3
          }
        },
        loc: {
          start: {
            line: 9,
            column: 42
          },
          end: {
            line: 14,
            column: 3
          }
        },
        line: 9
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
    hash: "90549c45169858f251f769a41262ff127035628d"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_27w5obuyrh = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_27w5obuyrh();
import { WorkspaceDto } from '@studio-lite-lib/api-dto';
export class WorkspaceChecked {
  id: number;
  name: string;
  isChecked: boolean;
  accessLevel: number;
  constructor(workspaceDto: WorkspaceDto) {
    cov_27w5obuyrh().f[0]++;
    cov_27w5obuyrh().s[0]++;
    this.id = workspaceDto.id;
    cov_27w5obuyrh().s[1]++;
    this.name = workspaceDto.name;
    cov_27w5obuyrh().s[2]++;
    this.isChecked = false;
    cov_27w5obuyrh().s[3]++;
    this.accessLevel = 0;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMjd3NW9idXlyaCIsImFjdHVhbENvdmVyYWdlIiwiV29ya3NwYWNlRHRvIiwiV29ya3NwYWNlQ2hlY2tlZCIsImlkIiwibmFtZSIsImlzQ2hlY2tlZCIsImFjY2Vzc0xldmVsIiwiY29uc3RydWN0b3IiLCJ3b3Jrc3BhY2VEdG8iLCJmIiwicyJdLCJzb3VyY2VzIjpbIndvcmtzcGFjZS1jaGVja2VkLmNsYXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFdvcmtzcGFjZUR0byB9IGZyb20gJ0BzdHVkaW8tbGl0ZS1saWIvYXBpLWR0byc7XG5cbmV4cG9ydCBjbGFzcyBXb3Jrc3BhY2VDaGVja2VkIHtcbiAgaWQ6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xuICBpc0NoZWNrZWQ6IGJvb2xlYW47XG4gIGFjY2Vzc0xldmVsOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iod29ya3NwYWNlRHRvOiBXb3Jrc3BhY2VEdG8pIHtcbiAgICB0aGlzLmlkID0gd29ya3NwYWNlRHRvLmlkO1xuICAgIHRoaXMubmFtZSA9IHdvcmtzcGFjZUR0by5uYW1lO1xuICAgIHRoaXMuaXNDaGVja2VkID0gZmFsc2U7XG4gICAgdGhpcy5hY2Nlc3NMZXZlbCA9IDA7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxjQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxjQUFBO0FBZlosU0FBU0UsWUFBWSxRQUFRLDBCQUEwQjtBQUV2RCxPQUFPLE1BQU1DLGdCQUFnQixDQUFDO0VBQzVCQyxFQUFFLEVBQUUsTUFBTTtFQUNWQyxJQUFJLEVBQUUsTUFBTTtFQUNaQyxTQUFTLEVBQUUsT0FBTztFQUNsQkMsV0FBVyxFQUFFLE1BQU07RUFFbkJDLFdBQVdBLENBQUNDLFlBQVksRUFBRVAsWUFBWSxFQUFFO0lBQUFGLGNBQUEsR0FBQVUsQ0FBQTtJQUFBVixjQUFBLEdBQUFXLENBQUE7SUFDdEMsSUFBSSxDQUFDUCxFQUFFLEdBQUdLLFlBQVksQ0FBQ0wsRUFBRTtJQUFDSixjQUFBLEdBQUFXLENBQUE7SUFDMUIsSUFBSSxDQUFDTixJQUFJLEdBQUdJLFlBQVksQ0FBQ0osSUFBSTtJQUFDTCxjQUFBLEdBQUFXLENBQUE7SUFDOUIsSUFBSSxDQUFDTCxTQUFTLEdBQUcsS0FBSztJQUFDTixjQUFBLEdBQUFXLENBQUE7SUFDdkIsSUFBSSxDQUFDSixXQUFXLEdBQUcsQ0FBQztFQUN0QjtBQUNGIiwiaWdub3JlTGlzdCI6W119