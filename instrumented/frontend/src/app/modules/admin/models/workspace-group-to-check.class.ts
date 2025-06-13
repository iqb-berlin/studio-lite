function cov_ahfsoex25() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/admin/models/workspace-group-to-check.class.ts";
  var hash = "9055c0bd09f6987df1645bf01f9504ac05f08b37";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/admin/models/workspace-group-to-check.class.ts",
    statementMap: {
      "0": {
        start: {
          line: 8,
          column: 4
        },
        end: {
          line: 8,
          column: 32
        }
      },
      "1": {
        start: {
          line: 9,
          column: 4
        },
        end: {
          line: 9,
          column: 36
        }
      },
      "2": {
        start: {
          line: 10,
          column: 4
        },
        end: {
          line: 10,
          column: 27
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 7,
            column: 2
          },
          end: {
            line: 7,
            column: 3
          }
        },
        loc: {
          start: {
            line: 7,
            column: 55
          },
          end: {
            line: 11,
            column: 3
          }
        },
        line: 7
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
    hash: "9055c0bd09f6987df1645bf01f9504ac05f08b37"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_ahfsoex25 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_ahfsoex25();
import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
export class WorkspaceGroupToCheck {
  id: number;
  name: string;
  isChecked: boolean;
  constructor(workspaceGroup: WorkspaceGroupInListDto) {
    cov_ahfsoex25().f[0]++;
    cov_ahfsoex25().s[0]++;
    this.id = workspaceGroup.id;
    cov_ahfsoex25().s[1]++;
    this.name = workspaceGroup.name;
    cov_ahfsoex25().s[2]++;
    this.isChecked = false;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfYWhmc29leDI1IiwiYWN0dWFsQ292ZXJhZ2UiLCJXb3Jrc3BhY2VHcm91cEluTGlzdER0byIsIldvcmtzcGFjZUdyb3VwVG9DaGVjayIsImlkIiwibmFtZSIsImlzQ2hlY2tlZCIsImNvbnN0cnVjdG9yIiwid29ya3NwYWNlR3JvdXAiLCJmIiwicyJdLCJzb3VyY2VzIjpbIndvcmtzcGFjZS1ncm91cC10by1jaGVjay5jbGFzcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBXb3Jrc3BhY2VHcm91cEluTGlzdER0byB9IGZyb20gJ0BzdHVkaW8tbGl0ZS1saWIvYXBpLWR0byc7XG5cbmV4cG9ydCBjbGFzcyBXb3Jrc3BhY2VHcm91cFRvQ2hlY2sge1xuICBpZDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG4gIGlzQ2hlY2tlZDogYm9vbGVhbjtcbiAgY29uc3RydWN0b3Iod29ya3NwYWNlR3JvdXA6IFdvcmtzcGFjZUdyb3VwSW5MaXN0RHRvKSB7XG4gICAgdGhpcy5pZCA9IHdvcmtzcGFjZUdyb3VwLmlkO1xuICAgIHRoaXMubmFtZSA9IHdvcmtzcGFjZUdyb3VwLm5hbWU7XG4gICAgdGhpcy5pc0NoZWNrZWQgPSBmYWxzZTtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosU0FBU0UsdUJBQXVCLFFBQVEsMEJBQTBCO0FBRWxFLE9BQU8sTUFBTUMscUJBQXFCLENBQUM7RUFDakNDLEVBQUUsRUFBRSxNQUFNO0VBQ1ZDLElBQUksRUFBRSxNQUFNO0VBQ1pDLFNBQVMsRUFBRSxPQUFPO0VBQ2xCQyxXQUFXQSxDQUFDQyxjQUFjLEVBQUVOLHVCQUF1QixFQUFFO0lBQUFGLGFBQUEsR0FBQVMsQ0FBQTtJQUFBVCxhQUFBLEdBQUFVLENBQUE7SUFDbkQsSUFBSSxDQUFDTixFQUFFLEdBQUdJLGNBQWMsQ0FBQ0osRUFBRTtJQUFDSixhQUFBLEdBQUFVLENBQUE7SUFDNUIsSUFBSSxDQUFDTCxJQUFJLEdBQUdHLGNBQWMsQ0FBQ0gsSUFBSTtJQUFDTCxhQUFBLEdBQUFVLENBQUE7SUFDaEMsSUFBSSxDQUFDSixTQUFTLEdBQUcsS0FBSztFQUN4QjtBQUNGIiwiaWdub3JlTGlzdCI6W119