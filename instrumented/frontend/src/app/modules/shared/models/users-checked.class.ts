function cov_23vb6csxhe() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/shared/models/users-checked.class.ts";
  var hash = "fbaa122f09fb291c04600e7f4b4b68a81073a2dd";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/shared/models/users-checked.class.ts",
    statementMap: {
      "0": {
        start: {
          line: 10,
          column: 4
        },
        end: {
          line: 10,
          column: 25
        }
      },
      "1": {
        start: {
          line: 11,
          column: 4
        },
        end: {
          line: 11,
          column: 29
        }
      },
      "2": {
        start: {
          line: 12,
          column: 4
        },
        end: {
          line: 12,
          column: 43
        }
      },
      "3": {
        start: {
          line: 13,
          column: 4
        },
        end: {
          line: 13,
          column: 43
        }
      },
      "4": {
        start: {
          line: 14,
          column: 4
        },
        end: {
          line: 14,
          column: 27
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
            column: 38
          },
          end: {
            line: 15,
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
      "3": 0,
      "4": 0
    },
    f: {
      "0": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "fbaa122f09fb291c04600e7f4b4b68a81073a2dd"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_23vb6csxhe = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_23vb6csxhe();
import { UserInListDto } from '@studio-lite-lib/api-dto';
export class UserChecked {
  id: number;
  name: string;
  displayName: string | undefined;
  description: string | undefined;
  isChecked: boolean;
  constructor(userDto: UserInListDto) {
    cov_23vb6csxhe().f[0]++;
    cov_23vb6csxhe().s[0]++;
    this.id = userDto.id;
    cov_23vb6csxhe().s[1]++;
    this.name = userDto.name;
    cov_23vb6csxhe().s[2]++;
    this.displayName = userDto.displayName;
    cov_23vb6csxhe().s[3]++;
    this.description = userDto.description;
    cov_23vb6csxhe().s[4]++;
    this.isChecked = false;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMjN2YjZjc3hoZSIsImFjdHVhbENvdmVyYWdlIiwiVXNlckluTGlzdER0byIsIlVzZXJDaGVja2VkIiwiaWQiLCJuYW1lIiwiZGlzcGxheU5hbWUiLCJkZXNjcmlwdGlvbiIsImlzQ2hlY2tlZCIsImNvbnN0cnVjdG9yIiwidXNlckR0byIsImYiLCJzIl0sInNvdXJjZXMiOlsidXNlcnMtY2hlY2tlZC5jbGFzcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVc2VySW5MaXN0RHRvIH0gZnJvbSAnQHN0dWRpby1saXRlLWxpYi9hcGktZHRvJztcblxuZXhwb3J0IGNsYXNzIFVzZXJDaGVja2VkIHtcbiAgaWQ6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xuICBkaXNwbGF5TmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBpc0NoZWNrZWQ6IGJvb2xlYW47XG4gIGNvbnN0cnVjdG9yKHVzZXJEdG86IFVzZXJJbkxpc3REdG8pIHtcbiAgICB0aGlzLmlkID0gdXNlckR0by5pZDtcbiAgICB0aGlzLm5hbWUgPSB1c2VyRHRvLm5hbWU7XG4gICAgdGhpcy5kaXNwbGF5TmFtZSA9IHVzZXJEdG8uZGlzcGxheU5hbWU7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IHVzZXJEdG8uZGVzY3JpcHRpb247XG4gICAgdGhpcy5pc0NoZWNrZWQgPSBmYWxzZTtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsY0FBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsY0FBQTtBQWZaLFNBQVNFLGFBQWEsUUFBUSwwQkFBMEI7QUFFeEQsT0FBTyxNQUFNQyxXQUFXLENBQUM7RUFDdkJDLEVBQUUsRUFBRSxNQUFNO0VBQ1ZDLElBQUksRUFBRSxNQUFNO0VBQ1pDLFdBQVcsRUFBRSxNQUFNLEdBQUcsU0FBUztFQUMvQkMsV0FBVyxFQUFFLE1BQU0sR0FBRyxTQUFTO0VBQy9CQyxTQUFTLEVBQUUsT0FBTztFQUNsQkMsV0FBV0EsQ0FBQ0MsT0FBTyxFQUFFUixhQUFhLEVBQUU7SUFBQUYsY0FBQSxHQUFBVyxDQUFBO0lBQUFYLGNBQUEsR0FBQVksQ0FBQTtJQUNsQyxJQUFJLENBQUNSLEVBQUUsR0FBR00sT0FBTyxDQUFDTixFQUFFO0lBQUNKLGNBQUEsR0FBQVksQ0FBQTtJQUNyQixJQUFJLENBQUNQLElBQUksR0FBR0ssT0FBTyxDQUFDTCxJQUFJO0lBQUNMLGNBQUEsR0FBQVksQ0FBQTtJQUN6QixJQUFJLENBQUNOLFdBQVcsR0FBR0ksT0FBTyxDQUFDSixXQUFXO0lBQUNOLGNBQUEsR0FBQVksQ0FBQTtJQUN2QyxJQUFJLENBQUNMLFdBQVcsR0FBR0csT0FBTyxDQUFDSCxXQUFXO0lBQUNQLGNBQUEsR0FBQVksQ0FBQTtJQUN2QyxJQUFJLENBQUNKLFNBQVMsR0FBRyxLQUFLO0VBQ3hCO0FBQ0YiLCJpZ25vcmVMaXN0IjpbXX0=