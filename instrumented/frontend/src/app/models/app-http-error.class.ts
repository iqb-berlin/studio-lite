function cov_16rsudu3hg() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/models/app-http-error.class.ts";
  var hash = "ce4e453ae3be3b7fb772aa993f0f6553c9b35631";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/models/app-http-error.class.ts",
    statementMap: {
      "0": {
        start: {
          line: 6,
          column: 11
        },
        end: {
          line: 6,
          column: 13
        }
      },
      "1": {
        start: {
          line: 7,
          column: 18
        },
        end: {
          line: 7,
          column: 20
        }
      },
      "2": {
        start: {
          line: 8,
          column: 7
        },
        end: {
          line: 8,
          column: 8
        }
      },
      "3": {
        start: {
          line: 11,
          column: 4
        },
        end: {
          line: 11,
          column: 79
        }
      },
      "4": {
        start: {
          line: 12,
          column: 4
        },
        end: {
          line: 12,
          column: 114
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
            column: 43
          },
          end: {
            line: 13,
            column: 3
          }
        },
        line: 10
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 11,
            column: 18
          },
          end: {
            line: 11,
            column: 78
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 11,
            column: 57
          },
          end: {
            line: 11,
            column: 60
          }
        }, {
          start: {
            line: 11,
            column: 63
          },
          end: {
            line: 11,
            column: 78
          }
        }],
        line: 11
      },
      "1": {
        loc: {
          start: {
            line: 12,
            column: 19
          },
          end: {
            line: 12,
            column: 113
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 12,
            column: 58
          },
          end: {
            line: 12,
            column: 94
          }
        }, {
          start: {
            line: 12,
            column: 97
          },
          end: {
            line: 12,
            column: 113
          }
        }],
        line: 12
      }
    },
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
    b: {
      "0": [0, 0],
      "1": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "ce4e453ae3be3b7fb772aa993f0f6553c9b35631"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_16rsudu3hg = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_16rsudu3hg();
import { HttpErrorResponse } from '@angular/common/http';
export class AppHttpError {
  status: number;
  message: string;
  method = (cov_16rsudu3hg().s[0]++, '');
  urlWithParams = (cov_16rsudu3hg().s[1]++, '');
  id = (cov_16rsudu3hg().s[2]++, 0);
  constructor(errorObj: HttpErrorResponse) {
    cov_16rsudu3hg().f[0]++;
    cov_16rsudu3hg().s[3]++;
    this.status = errorObj.error instanceof ErrorEvent ? (cov_16rsudu3hg().b[0][0]++, 999) : (cov_16rsudu3hg().b[0][1]++, errorObj.status);
    cov_16rsudu3hg().s[4]++;
    this.message = errorObj.error instanceof ErrorEvent ? (cov_16rsudu3hg().b[1][0]++, (<ErrorEvent> errorObj.error).message) : (cov_16rsudu3hg().b[1][1]++, errorObj.message);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfMTZyc3VkdTNoZyIsImFjdHVhbENvdmVyYWdlIiwiSHR0cEVycm9yUmVzcG9uc2UiLCJBcHBIdHRwRXJyb3IiLCJzdGF0dXMiLCJtZXNzYWdlIiwibWV0aG9kIiwicyIsInVybFdpdGhQYXJhbXMiLCJpZCIsImNvbnN0cnVjdG9yIiwiZXJyb3JPYmoiLCJmIiwiZXJyb3IiLCJFcnJvckV2ZW50IiwiYiJdLCJzb3VyY2VzIjpbImFwcC1odHRwLWVycm9yLmNsYXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBFcnJvclJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5leHBvcnQgY2xhc3MgQXBwSHR0cEVycm9yIHtcbiAgc3RhdHVzOiBudW1iZXI7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgbWV0aG9kID0gJyc7XG4gIHVybFdpdGhQYXJhbXMgPSAnJztcbiAgaWQgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGVycm9yT2JqOiBIdHRwRXJyb3JSZXNwb25zZSkge1xuICAgIHRoaXMuc3RhdHVzID0gZXJyb3JPYmouZXJyb3IgaW5zdGFuY2VvZiBFcnJvckV2ZW50ID8gOTk5IDogZXJyb3JPYmouc3RhdHVzO1xuICAgIHRoaXMubWVzc2FnZSA9IGVycm9yT2JqLmVycm9yIGluc3RhbmNlb2YgRXJyb3JFdmVudCA/ICg8RXJyb3JFdmVudD5lcnJvck9iai5lcnJvcikubWVzc2FnZSA6IGVycm9yT2JqLm1lc3NhZ2U7XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxjQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxjQUFBO0FBZlosU0FBU0UsaUJBQWlCLFFBQVEsc0JBQXNCO0FBRXhELE9BQU8sTUFBTUMsWUFBWSxDQUFDO0VBQ3hCQyxNQUFNLEVBQUUsTUFBTTtFQUNkQyxPQUFPLEVBQUUsTUFBTTtFQUNmQyxNQUFNLElBQUFOLGNBQUEsR0FBQU8sQ0FBQSxPQUFHLEVBQUU7RUFDWEMsYUFBYSxJQUFBUixjQUFBLEdBQUFPLENBQUEsT0FBRyxFQUFFO0VBQ2xCRSxFQUFFLElBQUFULGNBQUEsR0FBQU8sQ0FBQSxPQUFHLENBQUM7RUFFTkcsV0FBV0EsQ0FBQ0MsUUFBUSxFQUFFVCxpQkFBaUIsRUFBRTtJQUFBRixjQUFBLEdBQUFZLENBQUE7SUFBQVosY0FBQSxHQUFBTyxDQUFBO0lBQ3ZDLElBQUksQ0FBQ0gsTUFBTSxHQUFHTyxRQUFRLENBQUNFLEtBQUssWUFBWUMsVUFBVSxJQUFBZCxjQUFBLEdBQUFlLENBQUEsVUFBRyxHQUFHLEtBQUFmLGNBQUEsR0FBQWUsQ0FBQSxVQUFHSixRQUFRLENBQUNQLE1BQU07SUFBQ0osY0FBQSxHQUFBTyxDQUFBO0lBQzNFLElBQUksQ0FBQ0YsT0FBTyxHQUFHTSxRQUFRLENBQUNFLEtBQUssWUFBWUMsVUFBVSxJQUFBZCxjQUFBLEdBQUFlLENBQUEsVUFBRyxDQUFDLENBQUNELFVBQVUsRUFBQ0gsUUFBUSxDQUFDRSxLQUFLLEVBQUVSLE9BQU8sS0FBQUwsY0FBQSxHQUFBZSxDQUFBLFVBQUdKLFFBQVEsQ0FBQ04sT0FBTztFQUMvRztBQUNGIiwiaWdub3JlTGlzdCI6W119