function cov_d1b1y2bxp() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/review-id.decorator.ts";
  var hash = "4bada990f46878803c7c6e682763d3d215128755";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/review-id.decorator.ts",
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
          column: 33
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
    hash: "4bada990f46878803c7c6e682763d3d215128755"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_d1b1y2bxp = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_d1b1y2bxp();
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const ReviewId = (cov_d1b1y2bxp().s[0]++, createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  cov_d1b1y2bxp().f[0]++;
  const request = (cov_d1b1y2bxp().s[1]++, ctx.switchToHttp().getRequest());
  cov_d1b1y2bxp().s[2]++;
  return request.user.reviewId;
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfZDFiMXkyYnhwIiwiYWN0dWFsQ292ZXJhZ2UiLCJjcmVhdGVQYXJhbURlY29yYXRvciIsIkV4ZWN1dGlvbkNvbnRleHQiLCJSZXZpZXdJZCIsInMiLCJkYXRhIiwiY3R4IiwiZiIsInJlcXVlc3QiLCJzd2l0Y2hUb0h0dHAiLCJnZXRSZXF1ZXN0IiwidXNlciIsInJldmlld0lkIl0sInNvdXJjZXMiOlsicmV2aWV3LWlkLmRlY29yYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVQYXJhbURlY29yYXRvciwgRXhlY3V0aW9uQ29udGV4dCB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGNvbnN0IFJldmlld0lkID0gY3JlYXRlUGFyYW1EZWNvcmF0b3IoXG4gIChkYXRhOiB1bmtub3duLCBjdHg6IEV4ZWN1dGlvbkNvbnRleHQpID0+IHtcbiAgICBjb25zdCByZXF1ZXN0ID0gY3R4LnN3aXRjaFRvSHR0cCgpLmdldFJlcXVlc3QoKTtcbiAgICByZXR1cm4gcmVxdWVzdC51c2VyLnJldmlld0lkO1xuICB9XG4pO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosU0FBU0Usb0JBQW9CLEVBQUVDLGdCQUFnQixRQUFRLGdCQUFnQjtBQUV2RSxPQUFPLE1BQU1DLFFBQVEsSUFBQUosYUFBQSxHQUFBSyxDQUFBLE9BQUdILG9CQUFvQixDQUMxQyxDQUFDSSxJQUFJLEVBQUUsT0FBTyxFQUFFQyxHQUFHLEVBQUVKLGdCQUFnQixLQUFLO0VBQUFILGFBQUEsR0FBQVEsQ0FBQTtFQUN4QyxNQUFNQyxPQUFPLElBQUFULGFBQUEsR0FBQUssQ0FBQSxPQUFHRSxHQUFHLENBQUNHLFlBQVksQ0FBQyxDQUFDLENBQUNDLFVBQVUsQ0FBQyxDQUFDO0VBQUNYLGFBQUEsR0FBQUssQ0FBQTtFQUNoRCxPQUFPSSxPQUFPLENBQUNHLElBQUksQ0FBQ0MsUUFBUTtBQUM5QixDQUNGLENBQUMiLCJpZ25vcmVMaXN0IjpbXX0=