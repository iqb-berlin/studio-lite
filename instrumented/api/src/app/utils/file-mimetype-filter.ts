function cov_60vq5heoq() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/utils/file-mimetype-filter.ts";
  var hash = "2150d9936fd3fd92afeda11b7bd07213dfcd30a9";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/utils/file-mimetype-filter.ts",
    statementMap: {
      "0": {
        start: {
          line: 4,
          column: 2
        },
        end: {
          line: 19,
          column: 4
        }
      },
      "1": {
        start: {
          line: 9,
          column: 4
        },
        end: {
          line: 18,
          column: 5
        }
      },
      "2": {
        start: {
          line: 9,
          column: 35
        },
        end: {
          line: 9,
          column: 67
        }
      },
      "3": {
        start: {
          line: 10,
          column: 6
        },
        end: {
          line: 10,
          column: 27
        }
      },
      "4": {
        start: {
          line: 12,
          column: 6
        },
        end: {
          line: 17,
          column: 8
        }
      }
    },
    fnMap: {
      "0": {
        name: "fileMimetypeFilter",
        decl: {
          start: {
            line: 3,
            column: 16
          },
          end: {
            line: 3,
            column: 34
          }
        },
        loc: {
          start: {
            line: 3,
            column: 59
          },
          end: {
            line: 20,
            column: 1
          }
        },
        line: 3
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 4,
            column: 9
          },
          end: {
            line: 4,
            column: 10
          }
        },
        loc: {
          start: {
            line: 8,
            column: 7
          },
          end: {
            line: 19,
            column: 3
          }
        },
        line: 8
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 9,
            column: 23
          },
          end: {
            line: 9,
            column: 24
          }
        },
        loc: {
          start: {
            line: 9,
            column: 35
          },
          end: {
            line: 9,
            column: 67
          }
        },
        line: 9
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 9,
            column: 4
          },
          end: {
            line: 18,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 9,
            column: 4
          },
          end: {
            line: 18,
            column: 5
          }
        }, {
          start: {
            line: 11,
            column: 11
          },
          end: {
            line: 18,
            column: 5
          }
        }],
        line: 9
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
      "0": 0,
      "1": 0,
      "2": 0
    },
    b: {
      "0": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "2150d9936fd3fd92afeda11b7bd07213dfcd30a9"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_60vq5heoq = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_60vq5heoq();
import { UnsupportedMediaTypeException } from '@nestjs/common';
export function fileMimetypeFilter(...mimetypes: string[]) {
  cov_60vq5heoq().f[0]++;
  cov_60vq5heoq().s[0]++;
  return (req, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    cov_60vq5heoq().f[1]++;
    cov_60vq5heoq().s[1]++;
    if (mimetypes.some(mimetype => {
      cov_60vq5heoq().f[2]++;
      cov_60vq5heoq().s[2]++;
      return file.mimetype.includes(mimetype);
    })) {
      cov_60vq5heoq().b[0][0]++;
      cov_60vq5heoq().s[3]++;
      callback(null, true);
    } else {
      cov_60vq5heoq().b[0][1]++;
      cov_60vq5heoq().s[4]++;
      callback(new UnsupportedMediaTypeException(`File type is not matching: ${mimetypes.join(', ')}`), false);
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfNjB2cTVoZW9xIiwiYWN0dWFsQ292ZXJhZ2UiLCJVbnN1cHBvcnRlZE1lZGlhVHlwZUV4Y2VwdGlvbiIsImZpbGVNaW1ldHlwZUZpbHRlciIsIm1pbWV0eXBlcyIsImYiLCJzIiwicmVxIiwiZmlsZSIsIkV4cHJlc3MiLCJNdWx0ZXIiLCJGaWxlIiwiY2FsbGJhY2siLCJlcnJvciIsIkVycm9yIiwiYWNjZXB0RmlsZSIsInNvbWUiLCJtaW1ldHlwZSIsImluY2x1ZGVzIiwiYiIsImpvaW4iXSwic291cmNlcyI6WyJmaWxlLW1pbWV0eXBlLWZpbHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVbnN1cHBvcnRlZE1lZGlhVHlwZUV4Y2VwdGlvbiB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbGVNaW1ldHlwZUZpbHRlciguLi5taW1ldHlwZXM6IHN0cmluZ1tdKSB7XG4gIHJldHVybiAoXG4gICAgcmVxLFxuICAgIGZpbGU6IEV4cHJlc3MuTXVsdGVyLkZpbGUsXG4gICAgY2FsbGJhY2s6IChlcnJvcjogRXJyb3IgfCBudWxsLCBhY2NlcHRGaWxlOiBib29sZWFuKSA9PiB2b2lkXG4gICkgPT4ge1xuICAgIGlmIChtaW1ldHlwZXMuc29tZShtaW1ldHlwZSA9PiBmaWxlLm1pbWV0eXBlLmluY2x1ZGVzKG1pbWV0eXBlKSkpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayhcbiAgICAgICAgbmV3IFVuc3VwcG9ydGVkTWVkaWFUeXBlRXhjZXB0aW9uKFxuICAgICAgICAgIGBGaWxlIHR5cGUgaXMgbm90IG1hdGNoaW5nOiAke21pbWV0eXBlcy5qb2luKCcsICcpfWBcbiAgICAgICAgKSxcbiAgICAgICAgZmFsc2VcbiAgICAgICk7XG4gICAgfVxuICB9O1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosU0FBU0UsNkJBQTZCLFFBQVEsZ0JBQWdCO0FBRTlELE9BQU8sU0FBU0Msa0JBQWtCQSxDQUFDLEdBQUdDLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRTtFQUFBSixhQUFBLEdBQUFLLENBQUE7RUFBQUwsYUFBQSxHQUFBTSxDQUFBO0VBQ3pELE9BQU8sQ0FDTEMsR0FBRyxFQUNIQyxJQUFJLEVBQUVDLE9BQU8sQ0FBQ0MsTUFBTSxDQUFDQyxJQUFJLEVBQ3pCQyxRQUFRLEVBQUUsQ0FBQ0MsS0FBSyxFQUFFQyxLQUFLLEdBQUcsSUFBSSxFQUFFQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxLQUN6RDtJQUFBZixhQUFBLEdBQUFLLENBQUE7SUFBQUwsYUFBQSxHQUFBTSxDQUFBO0lBQ0gsSUFBSUYsU0FBUyxDQUFDWSxJQUFJLENBQUNDLFFBQVEsSUFBSTtNQUFBakIsYUFBQSxHQUFBSyxDQUFBO01BQUFMLGFBQUEsR0FBQU0sQ0FBQTtNQUFBLE9BQUFFLElBQUksQ0FBQ1MsUUFBUSxDQUFDQyxRQUFRLENBQUNELFFBQVEsQ0FBQztJQUFELENBQUMsQ0FBQyxFQUFFO01BQUFqQixhQUFBLEdBQUFtQixDQUFBO01BQUFuQixhQUFBLEdBQUFNLENBQUE7TUFDaEVNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQ3RCLENBQUMsTUFBTTtNQUFBWixhQUFBLEdBQUFtQixDQUFBO01BQUFuQixhQUFBLEdBQUFNLENBQUE7TUFDTE0sUUFBUSxDQUNOLElBQUlWLDZCQUE2QixDQUMvQiw4QkFBOEJFLFNBQVMsQ0FBQ2dCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDcEQsQ0FBQyxFQUNELEtBQ0YsQ0FBQztJQUNIO0VBQ0YsQ0FBQztBQUNIIiwiaWdub3JlTGlzdCI6W119