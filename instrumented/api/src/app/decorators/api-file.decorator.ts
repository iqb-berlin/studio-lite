function cov_iyjr3r8oh() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/api-file.decorator.ts";
  var hash = "6eb1fc2caf5b2d6ed389899c2a9b096ebf865ca9";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/app/decorators/api-file.decorator.ts",
    statementMap: {
      "0": {
        start: {
          line: 11,
          column: 2
        },
        end: {
          line: 26,
          column: 4
        }
      }
    },
    fnMap: {
      "0": {
        name: "ApiFile",
        decl: {
          start: {
            line: 6,
            column: 16
          },
          end: {
            line: 6,
            column: 23
          }
        },
        loc: {
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 27,
            column: 1
          }
        },
        line: 10
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 7,
            column: 2
          },
          end: {
            line: 7,
            column: 28
          }
        },
        type: "default-arg",
        locations: [{
          start: {
            line: 7,
            column: 22
          },
          end: {
            line: 7,
            column: 28
          }
        }],
        line: 7
      },
      "1": {
        loc: {
          start: {
            line: 8,
            column: 2
          },
          end: {
            line: 8,
            column: 27
          }
        },
        type: "default-arg",
        locations: [{
          start: {
            line: 8,
            column: 22
          },
          end: {
            line: 8,
            column: 27
          }
        }],
        line: 8
      },
      "2": {
        loc: {
          start: {
            line: 17,
            column: 18
          },
          end: {
            line: 17,
            column: 45
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 17,
            column: 29
          },
          end: {
            line: 17,
            column: 40
          }
        }, {
          start: {
            line: 17,
            column: 43
          },
          end: {
            line: 17,
            column: 45
          }
        }],
        line: 17
      }
    },
    s: {
      "0": 0
    },
    f: {
      "0": 0
    },
    b: {
      "0": [0],
      "1": [0],
      "2": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "6eb1fc2caf5b2d6ed389899c2a9b096ebf865ca9"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_iyjr3r8oh = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_iyjr3r8oh();
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
export function ApiFile(fieldName: string = (cov_iyjr3r8oh().b[0][0]++, 'file'), required: boolean = (cov_iyjr3r8oh().b[1][0]++, false), localOptions?: MulterOptions) {
  cov_iyjr3r8oh().f[0]++;
  cov_iyjr3r8oh().s[0]++;
  return applyDecorators(UseInterceptors(FileInterceptor(fieldName, localOptions)), ApiConsumes('multipart/form-data'), ApiBody({
    schema: {
      type: 'object',
      required: required ? (cov_iyjr3r8oh().b[2][0]++, [fieldName]) : (cov_iyjr3r8oh().b[2][1]++, []),
      properties: {
        [fieldName]: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  }));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfaXlqcjNyOG9oIiwiYWN0dWFsQ292ZXJhZ2UiLCJhcHBseURlY29yYXRvcnMiLCJVc2VJbnRlcmNlcHRvcnMiLCJGaWxlSW50ZXJjZXB0b3IiLCJBcGlCb2R5IiwiQXBpQ29uc3VtZXMiLCJNdWx0ZXJPcHRpb25zIiwiQXBpRmlsZSIsImZpZWxkTmFtZSIsImIiLCJyZXF1aXJlZCIsImxvY2FsT3B0aW9ucyIsImYiLCJzIiwic2NoZW1hIiwidHlwZSIsInByb3BlcnRpZXMiLCJmb3JtYXQiXSwic291cmNlcyI6WyJhcGktZmlsZS5kZWNvcmF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXBwbHlEZWNvcmF0b3JzLCBVc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBGaWxlSW50ZXJjZXB0b3IgfSBmcm9tICdAbmVzdGpzL3BsYXRmb3JtLWV4cHJlc3MnO1xuaW1wb3J0IHsgQXBpQm9keSwgQXBpQ29uc3VtZXMgfSBmcm9tICdAbmVzdGpzL3N3YWdnZXInO1xuaW1wb3J0IHsgTXVsdGVyT3B0aW9ucyB9IGZyb20gJ0BuZXN0anMvcGxhdGZvcm0tZXhwcmVzcy9tdWx0ZXIvaW50ZXJmYWNlcy9tdWx0ZXItb3B0aW9ucy5pbnRlcmZhY2UnO1xuXG5leHBvcnQgZnVuY3Rpb24gQXBpRmlsZShcbiAgZmllbGROYW1lOiBzdHJpbmcgPSAnZmlsZScsXG4gIHJlcXVpcmVkOiBib29sZWFuID0gZmFsc2UsXG4gIGxvY2FsT3B0aW9ucz86IE11bHRlck9wdGlvbnNcbikge1xuICByZXR1cm4gYXBwbHlEZWNvcmF0b3JzKFxuICAgIFVzZUludGVyY2VwdG9ycyhGaWxlSW50ZXJjZXB0b3IoZmllbGROYW1lLCBsb2NhbE9wdGlvbnMpKSxcbiAgICBBcGlDb25zdW1lcygnbXVsdGlwYXJ0L2Zvcm0tZGF0YScpLFxuICAgIEFwaUJvZHkoe1xuICAgICAgc2NoZW1hOiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICByZXF1aXJlZDogcmVxdWlyZWQgPyBbZmllbGROYW1lXSA6IFtdLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgW2ZpZWxkTmFtZV06IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZm9ybWF0OiAnYmluYXJ5J1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICk7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosU0FBU0UsZUFBZSxFQUFFQyxlQUFlLFFBQVEsZ0JBQWdCO0FBQ2pFLFNBQVNDLGVBQWUsUUFBUSwwQkFBMEI7QUFDMUQsU0FBU0MsT0FBTyxFQUFFQyxXQUFXLFFBQVEsaUJBQWlCO0FBQ3RELFNBQVNDLGFBQWEsUUFBUSxxRUFBcUU7QUFFbkcsT0FBTyxTQUFTQyxPQUFPQSxDQUNyQkMsU0FBUyxFQUFFLE1BQU0sSUFBQVQsYUFBQSxHQUFBVSxDQUFBLFVBQUcsTUFBTSxHQUMxQkMsUUFBUSxFQUFFLE9BQU8sSUFBQVgsYUFBQSxHQUFBVSxDQUFBLFVBQUcsS0FBSyxHQUN6QkUsWUFBNEIsQ0FBZixFQUFFTCxhQUFhLEVBQzVCO0VBQUFQLGFBQUEsR0FBQWEsQ0FBQTtFQUFBYixhQUFBLEdBQUFjLENBQUE7RUFDQSxPQUFPWixlQUFlLENBQ3BCQyxlQUFlLENBQUNDLGVBQWUsQ0FBQ0ssU0FBUyxFQUFFRyxZQUFZLENBQUMsQ0FBQyxFQUN6RE4sV0FBVyxDQUFDLHFCQUFxQixDQUFDLEVBQ2xDRCxPQUFPLENBQUM7SUFDTlUsTUFBTSxFQUFFO01BQ05DLElBQUksRUFBRSxRQUFRO01BQ2RMLFFBQVEsRUFBRUEsUUFBUSxJQUFBWCxhQUFBLEdBQUFVLENBQUEsVUFBRyxDQUFDRCxTQUFTLENBQUMsS0FBQVQsYUFBQSxHQUFBVSxDQUFBLFVBQUcsRUFBRTtNQUNyQ08sVUFBVSxFQUFFO1FBQ1YsQ0FBQ1IsU0FBUyxHQUFHO1VBQ1hPLElBQUksRUFBRSxRQUFRO1VBQ2RFLE1BQU0sRUFBRTtRQUNWO01BQ0Y7SUFDRjtFQUNGLENBQUMsQ0FDSCxDQUFDO0FBQ0giLCJpZ25vcmVMaXN0IjpbXX0=