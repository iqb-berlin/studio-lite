function cov_1h4n4mb9w4() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/wsg-admin/models/workspace-user-checked.class.ts";
  var hash = "0781bb73108c3a619ac628e4f37fed7426c3f7ea";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/wsg-admin/models/workspace-user-checked.class.ts",
    statementMap: {
      "0": {
        start: {
          line: 11,
          column: 4
        },
        end: {
          line: 11,
          column: 25
        }
      },
      "1": {
        start: {
          line: 12,
          column: 4
        },
        end: {
          line: 12,
          column: 29
        }
      },
      "2": {
        start: {
          line: 13,
          column: 4
        },
        end: {
          line: 13,
          column: 43
        }
      },
      "3": {
        start: {
          line: 14,
          column: 4
        },
        end: {
          line: 14,
          column: 43
        }
      },
      "4": {
        start: {
          line: 15,
          column: 4
        },
        end: {
          line: 15,
          column: 25
        }
      },
      "5": {
        start: {
          line: 16,
          column: 4
        },
        end: {
          line: 16,
          column: 27
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 10,
            column: 3
          }
        },
        loc: {
          start: {
            line: 10,
            column: 38
          },
          end: {
            line: 17,
            column: 3
          }
        },
        line: 10
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    f: {
      "0": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "0781bb73108c3a619ac628e4f37fed7426c3f7ea"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1h4n4mb9w4 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1h4n4mb9w4();
import { UserInListDto } from '@studio-lite-lib/api-dto';
export class WorkspaceUserChecked {
  id: number;
  name: string;
  displayName: string | undefined;
  description: string | undefined;
  accessLevel: number;
  isChecked: boolean;
  constructor(userDto: UserInListDto) {
    cov_1h4n4mb9w4().f[0]++;
    cov_1h4n4mb9w4().s[0]++;
    this.id = userDto.id;
    cov_1h4n4mb9w4().s[1]++;
    this.name = userDto.name;
    cov_1h4n4mb9w4().s[2]++;
    this.displayName = userDto.displayName;
    cov_1h4n4mb9w4().s[3]++;
    this.description = userDto.description;
    cov_1h4n4mb9w4().s[4]++;
    this.accessLevel = 0;
    cov_1h4n4mb9w4().s[5]++;
    this.isChecked = false;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMWg0bjRtYjl3NCIsImFjdHVhbENvdmVyYWdlIiwiVXNlckluTGlzdER0byIsIldvcmtzcGFjZVVzZXJDaGVja2VkIiwiaWQiLCJuYW1lIiwiZGlzcGxheU5hbWUiLCJkZXNjcmlwdGlvbiIsImFjY2Vzc0xldmVsIiwiaXNDaGVja2VkIiwiY29uc3RydWN0b3IiLCJ1c2VyRHRvIiwiZiIsInMiXSwic291cmNlcyI6WyJ3b3Jrc3BhY2UtdXNlci1jaGVja2VkLmNsYXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFVzZXJJbkxpc3REdG8gfSBmcm9tICdAc3R1ZGlvLWxpdGUtbGliL2FwaS1kdG8nO1xuXG5leHBvcnQgY2xhc3MgV29ya3NwYWNlVXNlckNoZWNrZWQge1xuICBpZDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG4gIGRpc3BsYXlOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGFjY2Vzc0xldmVsOiBudW1iZXI7XG4gIGlzQ2hlY2tlZDogYm9vbGVhbjtcbiAgY29uc3RydWN0b3IodXNlckR0bzogVXNlckluTGlzdER0bykge1xuICAgIHRoaXMuaWQgPSB1c2VyRHRvLmlkO1xuICAgIHRoaXMubmFtZSA9IHVzZXJEdG8ubmFtZTtcbiAgICB0aGlzLmRpc3BsYXlOYW1lID0gdXNlckR0by5kaXNwbGF5TmFtZTtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gdXNlckR0by5kZXNjcmlwdGlvbjtcbiAgICB0aGlzLmFjY2Vzc0xldmVsID0gMDtcbiAgICB0aGlzLmlzQ2hlY2tlZCA9IGZhbHNlO1xuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVZO0lBQUFBLGNBQUEsWUFBQUEsQ0FBQTtNQUFBLE9BQUFDLGNBQUE7SUFBQTtFQUFBO0VBQUEsT0FBQUEsY0FBQTtBQUFBO0FBQUFELGNBQUE7QUFmWixTQUFTRSxhQUFhLFFBQVEsMEJBQTBCO0FBRXhELE9BQU8sTUFBTUMsb0JBQW9CLENBQUM7RUFDaENDLEVBQUUsRUFBRSxNQUFNO0VBQ1ZDLElBQUksRUFBRSxNQUFNO0VBQ1pDLFdBQVcsRUFBRSxNQUFNLEdBQUcsU0FBUztFQUMvQkMsV0FBVyxFQUFFLE1BQU0sR0FBRyxTQUFTO0VBQy9CQyxXQUFXLEVBQUUsTUFBTTtFQUNuQkMsU0FBUyxFQUFFLE9BQU87RUFDbEJDLFdBQVdBLENBQUNDLE9BQU8sRUFBRVQsYUFBYSxFQUFFO0lBQUFGLGNBQUEsR0FBQVksQ0FBQTtJQUFBWixjQUFBLEdBQUFhLENBQUE7SUFDbEMsSUFBSSxDQUFDVCxFQUFFLEdBQUdPLE9BQU8sQ0FBQ1AsRUFBRTtJQUFDSixjQUFBLEdBQUFhLENBQUE7SUFDckIsSUFBSSxDQUFDUixJQUFJLEdBQUdNLE9BQU8sQ0FBQ04sSUFBSTtJQUFDTCxjQUFBLEdBQUFhLENBQUE7SUFDekIsSUFBSSxDQUFDUCxXQUFXLEdBQUdLLE9BQU8sQ0FBQ0wsV0FBVztJQUFDTixjQUFBLEdBQUFhLENBQUE7SUFDdkMsSUFBSSxDQUFDTixXQUFXLEdBQUdJLE9BQU8sQ0FBQ0osV0FBVztJQUFDUCxjQUFBLEdBQUFhLENBQUE7SUFDdkMsSUFBSSxDQUFDTCxXQUFXLEdBQUcsQ0FBQztJQUFDUixjQUFBLEdBQUFhLENBQUE7SUFDckIsSUFBSSxDQUFDSixTQUFTLEdBQUcsS0FBSztFQUN4QjtBQUNGIiwiaWdub3JlTGlzdCI6W119