function cov_kfpd2w8br() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/shared/models/verona-module.class.ts";
  var hash = "796ba6bb6457dce542032afb2b606f5e87b937be";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/shared/models/verona-module.class.ts",
    statementMap: {
      "0": {
        start: {
          line: 9,
          column: 9
        },
        end: {
          line: 9,
          column: 11
        }
      },
      "1": {
        start: {
          line: 12,
          column: 4
        },
        end: {
          line: 12,
          column: 60
        }
      },
      "2": {
        start: {
          line: 16,
          column: 4
        },
        end: {
          line: 16,
          column: 29
        }
      },
      "3": {
        start: {
          line: 17,
          column: 4
        },
        end: {
          line: 17,
          column: 37
        }
      },
      "4": {
        start: {
          line: 18,
          column: 4
        },
        end: {
          line: 18,
          column: 39
        }
      },
      "5": {
        start: {
          line: 19,
          column: 4
        },
        end: {
          line: 19,
          column: 44
        }
      },
      "6": {
        start: {
          line: 20,
          column: 4
        },
        end: {
          line: 20,
          column: 52
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 11,
            column: 2
          },
          end: {
            line: 11,
            column: 3
          }
        },
        loc: {
          start: {
            line: 11,
            column: 31
          },
          end: {
            line: 13,
            column: 3
          }
        },
        line: 11
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 15,
            column: 2
          },
          end: {
            line: 15,
            column: 3
          }
        },
        loc: {
          start: {
            line: 15,
            column: 48
          },
          end: {
            line: 21,
            column: 3
          }
        },
        line: 15
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 19,
            column: 20
          },
          end: {
            line: 19,
            column: 43
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 19,
            column: 20
          },
          end: {
            line: 19,
            column: 38
          }
        }, {
          start: {
            line: 19,
            column: 42
          },
          end: {
            line: 19,
            column: 43
          }
        }],
        line: 19
      },
      "1": {
        loc: {
          start: {
            line: 20,
            column: 24
          },
          end: {
            line: 20,
            column: 51
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 20,
            column: 24
          },
          end: {
            line: 20,
            column: 46
          }
        }, {
          start: {
            line: 20,
            column: 50
          },
          end: {
            line: 20,
            column: 51
          }
        }],
        line: 20
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0
    },
    f: {
      "0": 0,
      "1": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "796ba6bb6457dce542032afb2b606f5e87b937be"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_kfpd2w8br = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_kfpd2w8br();
import { VeronaModuleInListDto, VeronaModuleMetadataDto } from '@studio-lite-lib/api-dto';
export class VeronaModuleClass {
  key: string;
  sortKey: string;
  metadata: VeronaModuleMetadataDto;
  fileSize: number;
  fileDateTime: number;
  html = (cov_kfpd2w8br().s[0]++, '');
  get nameAndVersion(): string {
    cov_kfpd2w8br().f[0]++;
    cov_kfpd2w8br().s[1]++;
    return `${this.metadata.name} ${this.metadata.version}`;
  }
  constructor(modulData: VeronaModuleInListDto) {
    cov_kfpd2w8br().f[1]++;
    cov_kfpd2w8br().s[2]++;
    this.key = modulData.key;
    cov_kfpd2w8br().s[3]++;
    this.sortKey = modulData.sortKey;
    cov_kfpd2w8br().s[4]++;
    this.metadata = modulData.metadata;
    cov_kfpd2w8br().s[5]++;
    this.fileSize = (cov_kfpd2w8br().b[0][0]++, modulData.fileSize) || (cov_kfpd2w8br().b[0][1]++, 0);
    cov_kfpd2w8br().s[6]++;
    this.fileDateTime = (cov_kfpd2w8br().b[1][0]++, modulData.fileDateTime) || (cov_kfpd2w8br().b[1][1]++, 0);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3Zfa2ZwZDJ3OGJyIiwiYWN0dWFsQ292ZXJhZ2UiLCJWZXJvbmFNb2R1bGVJbkxpc3REdG8iLCJWZXJvbmFNb2R1bGVNZXRhZGF0YUR0byIsIlZlcm9uYU1vZHVsZUNsYXNzIiwia2V5Iiwic29ydEtleSIsIm1ldGFkYXRhIiwiZmlsZVNpemUiLCJmaWxlRGF0ZVRpbWUiLCJodG1sIiwicyIsIm5hbWVBbmRWZXJzaW9uIiwiZiIsIm5hbWUiLCJ2ZXJzaW9uIiwiY29uc3RydWN0b3IiLCJtb2R1bERhdGEiLCJiIl0sInNvdXJjZXMiOlsidmVyb25hLW1vZHVsZS5jbGFzcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWZXJvbmFNb2R1bGVJbkxpc3REdG8sIFZlcm9uYU1vZHVsZU1ldGFkYXRhRHRvIH0gZnJvbSAnQHN0dWRpby1saXRlLWxpYi9hcGktZHRvJztcblxuZXhwb3J0IGNsYXNzIFZlcm9uYU1vZHVsZUNsYXNzIHtcbiAga2V5OiBzdHJpbmc7XG4gIHNvcnRLZXk6IHN0cmluZztcbiAgbWV0YWRhdGE6IFZlcm9uYU1vZHVsZU1ldGFkYXRhRHRvO1xuICBmaWxlU2l6ZTogbnVtYmVyO1xuICBmaWxlRGF0ZVRpbWU6IG51bWJlcjtcbiAgaHRtbCA9ICcnO1xuXG4gIGdldCBuYW1lQW5kVmVyc2lvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLm1ldGFkYXRhLm5hbWV9ICR7dGhpcy5tZXRhZGF0YS52ZXJzaW9ufWA7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihtb2R1bERhdGE6IFZlcm9uYU1vZHVsZUluTGlzdER0bykge1xuICAgIHRoaXMua2V5ID0gbW9kdWxEYXRhLmtleTtcbiAgICB0aGlzLnNvcnRLZXkgPSBtb2R1bERhdGEuc29ydEtleTtcbiAgICB0aGlzLm1ldGFkYXRhID0gbW9kdWxEYXRhLm1ldGFkYXRhO1xuICAgIHRoaXMuZmlsZVNpemUgPSBtb2R1bERhdGEuZmlsZVNpemUgfHwgMDtcbiAgICB0aGlzLmZpbGVEYXRlVGltZSA9IG1vZHVsRGF0YS5maWxlRGF0ZVRpbWUgfHwgMDtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZVk7SUFBQUEsYUFBQSxZQUFBQSxDQUFBO01BQUEsT0FBQUMsY0FBQTtJQUFBO0VBQUE7RUFBQSxPQUFBQSxjQUFBO0FBQUE7QUFBQUQsYUFBQTtBQWZaLFNBQVNFLHFCQUFxQixFQUFFQyx1QkFBdUIsUUFBUSwwQkFBMEI7QUFFekYsT0FBTyxNQUFNQyxpQkFBaUIsQ0FBQztFQUM3QkMsR0FBRyxFQUFFLE1BQU07RUFDWEMsT0FBTyxFQUFFLE1BQU07RUFDZkMsUUFBUSxFQUFFSix1QkFBdUI7RUFDakNLLFFBQVEsRUFBRSxNQUFNO0VBQ2hCQyxZQUFZLEVBQUUsTUFBTTtFQUNwQkMsSUFBSSxJQUFBVixhQUFBLEdBQUFXLENBQUEsT0FBRyxFQUFFO0VBRVQsSUFBSUMsY0FBY0EsQ0FBQSxDQUFFLEVBQUUsTUFBTSxDQUFDO0lBQUFaLGFBQUEsR0FBQWEsQ0FBQTtJQUFBYixhQUFBLEdBQUFXLENBQUE7SUFDM0IsT0FBTyxHQUFHLElBQUksQ0FBQ0osUUFBUSxDQUFDTyxJQUFJLElBQUksSUFBSSxDQUFDUCxRQUFRLENBQUNRLE9BQU8sRUFBRTtFQUN6RDtFQUVBQyxXQUFXQSxDQUFDQyxTQUFTLEVBQUVmLHFCQUFxQixFQUFFO0lBQUFGLGFBQUEsR0FBQWEsQ0FBQTtJQUFBYixhQUFBLEdBQUFXLENBQUE7SUFDNUMsSUFBSSxDQUFDTixHQUFHLEdBQUdZLFNBQVMsQ0FBQ1osR0FBRztJQUFDTCxhQUFBLEdBQUFXLENBQUE7SUFDekIsSUFBSSxDQUFDTCxPQUFPLEdBQUdXLFNBQVMsQ0FBQ1gsT0FBTztJQUFDTixhQUFBLEdBQUFXLENBQUE7SUFDakMsSUFBSSxDQUFDSixRQUFRLEdBQUdVLFNBQVMsQ0FBQ1YsUUFBUTtJQUFDUCxhQUFBLEdBQUFXLENBQUE7SUFDbkMsSUFBSSxDQUFDSCxRQUFRLEdBQUcsQ0FBQVIsYUFBQSxHQUFBa0IsQ0FBQSxVQUFBRCxTQUFTLENBQUNULFFBQVEsTUFBQVIsYUFBQSxHQUFBa0IsQ0FBQSxVQUFJLENBQUM7SUFBQ2xCLGFBQUEsR0FBQVcsQ0FBQTtJQUN4QyxJQUFJLENBQUNGLFlBQVksR0FBRyxDQUFBVCxhQUFBLEdBQUFrQixDQUFBLFVBQUFELFNBQVMsQ0FBQ1IsWUFBWSxNQUFBVCxhQUFBLEdBQUFrQixDQUFBLFVBQUksQ0FBQztFQUNqRDtBQUNGIiwiaWdub3JlTGlzdCI6W119