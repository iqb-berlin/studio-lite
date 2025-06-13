function cov_j0jtttdey() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/api/src/main.ts";
  var hash = "6699f9d6dd2e4eeb3d151046ee6e0b88e8f354da";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/api/src/main.ts",
    statementMap: {
      "0": {
        start: {
          line: 12,
          column: 14
        },
        end: {
          line: 12,
          column: 73
        }
      },
      "1": {
        start: {
          line: 13,
          column: 2
        },
        end: {
          line: 13,
          column: 65
        }
      },
      "2": {
        start: {
          line: 14,
          column: 24
        },
        end: {
          line: 14,
          column: 46
        }
      },
      "3": {
        start: {
          line: 15,
          column: 15
        },
        end: {
          line: 15,
          column: 59
        }
      },
      "4": {
        start: {
          line: 16,
          column: 15
        },
        end: {
          line: 16,
          column: 19
        }
      },
      "5": {
        start: {
          line: 17,
          column: 23
        },
        end: {
          line: 17,
          column: 28
        }
      },
      "6": {
        start: {
          line: 19,
          column: 2
        },
        end: {
          line: 19,
          column: 36
        }
      },
      "7": {
        start: {
          line: 20,
          column: 2
        },
        end: {
          line: 20,
          column: 35
        }
      },
      "8": {
        start: {
          line: 23,
          column: 2
        },
        end: {
          line: 33,
          column: 3
        }
      },
      "9": {
        start: {
          line: 24,
          column: 19
        },
        end: {
          line: 29,
          column: 14
        }
      },
      "10": {
        start: {
          line: 31,
          column: 21
        },
        end: {
          line: 31,
          column: 62
        }
      },
      "11": {
        start: {
          line: 32,
          column: 4
        },
        end: {
          line: 32,
          column: 46
        }
      },
      "12": {
        start: {
          line: 35,
          column: 2
        },
        end: {
          line: 35,
          column: 31
        }
      },
      "13": {
        start: {
          line: 36,
          column: 2
        },
        end: {
          line: 38,
          column: 4
        }
      },
      "14": {
        start: {
          line: 41,
          column: 0
        },
        end: {
          line: 41,
          column: 12
        }
      }
    },
    fnMap: {
      "0": {
        name: "bootstrap",
        decl: {
          start: {
            line: 11,
            column: 15
          },
          end: {
            line: 11,
            column: 24
          }
        },
        loc: {
          start: {
            line: 11,
            column: 27
          },
          end: {
            line: 39,
            column: 1
          }
        },
        line: 11
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 15,
            column: 15
          },
          end: {
            line: 15,
            column: 59
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 15,
            column: 15
          },
          end: {
            line: 15,
            column: 44
          }
        }, {
          start: {
            line: 15,
            column: 48
          },
          end: {
            line: 15,
            column: 59
          }
        }],
        line: 15
      },
      "1": {
        loc: {
          start: {
            line: 23,
            column: 2
          },
          end: {
            line: 33,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 23,
            column: 2
          },
          end: {
            line: 33,
            column: 3
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 23
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0
    },
    f: {
      "0": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "6699f9d6dd2e4eeb3d151046ee6e0b88e8f354da"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_j0jtttdey = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_j0jtttdey();
import { json } from 'express';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
async function bootstrap() {
  cov_j0jtttdey().f[0]++;
  const app = (cov_j0jtttdey().s[0]++, await NestFactory.create<NestExpressApplication>(AppModule));
  cov_j0jtttdey().s[1]++;
  app.useStaticAssets('./packages', {
    prefix: '/api/packages'
  });
  const configService = (cov_j0jtttdey().s[2]++, app.get(ConfigService));
  const host = (cov_j0jtttdey().s[3]++, (cov_j0jtttdey().b[0][0]++, configService.get('API_HOST')) || (cov_j0jtttdey().b[0][1]++, '127.0.0.1'));
  const port = (cov_j0jtttdey().s[4]++, 3333);
  const globalPrefix = (cov_j0jtttdey().s[5]++, 'api');
  cov_j0jtttdey().s[6]++;
  app.setGlobalPrefix(globalPrefix);
  cov_j0jtttdey().s[7]++;
  app.use(json({
    limit: '50mb'
  }));

  // Enable Swagger-UI
  cov_j0jtttdey().s[8]++;
  if (!environment.production) {
    cov_j0jtttdey().b[1][0]++;
    const config = (cov_j0jtttdey().s[9]++, new DocumentBuilder().setTitle('IQB Studio Lite').setDescription('The IQB Studio Lite API description and try-out').setVersion(app.get('APP_VERSION')).addBearerAuth().build());
    const document = (cov_j0jtttdey().s[10]++, SwaggerModule.createDocument(app, config));
    cov_j0jtttdey().s[11]++;
    SwaggerModule.setup('api', app, document);
  } else {
    cov_j0jtttdey().b[1][1]++;
  }
  cov_j0jtttdey().s[12]++;
  await app.listen(port, host);
  cov_j0jtttdey().s[13]++;
  Logger.log(`🚀 Application is running on: http://${host}:${port}/${globalPrefix}`);
}
cov_j0jtttdey().s[14]++;
bootstrap();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfajBqdHR0ZGV5IiwiYWN0dWFsQ292ZXJhZ2UiLCJqc29uIiwiTG9nZ2VyIiwiQ29uZmlnU2VydmljZSIsIk5lc3RGYWN0b3J5IiwiRG9jdW1lbnRCdWlsZGVyIiwiU3dhZ2dlck1vZHVsZSIsIk5lc3RFeHByZXNzQXBwbGljYXRpb24iLCJBcHBNb2R1bGUiLCJlbnZpcm9ubWVudCIsImJvb3RzdHJhcCIsImYiLCJhcHAiLCJzIiwiY3JlYXRlIiwidXNlU3RhdGljQXNzZXRzIiwicHJlZml4IiwiY29uZmlnU2VydmljZSIsImdldCIsImhvc3QiLCJiIiwicG9ydCIsImdsb2JhbFByZWZpeCIsInNldEdsb2JhbFByZWZpeCIsInVzZSIsImxpbWl0IiwicHJvZHVjdGlvbiIsImNvbmZpZyIsInNldFRpdGxlIiwic2V0RGVzY3JpcHRpb24iLCJzZXRWZXJzaW9uIiwiYWRkQmVhcmVyQXV0aCIsImJ1aWxkIiwiZG9jdW1lbnQiLCJjcmVhdGVEb2N1bWVudCIsInNldHVwIiwibGlzdGVuIiwibG9nIl0sInNvdXJjZXMiOlsibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc29uIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBDb25maWdTZXJ2aWNlIH0gZnJvbSAnQG5lc3Rqcy9jb25maWcnO1xuaW1wb3J0IHsgTmVzdEZhY3RvcnkgfSBmcm9tICdAbmVzdGpzL2NvcmUnO1xuaW1wb3J0IHsgRG9jdW1lbnRCdWlsZGVyLCBTd2FnZ2VyTW9kdWxlIH0gZnJvbSAnQG5lc3Rqcy9zd2FnZ2VyJztcblxuaW1wb3J0IHsgTmVzdEV4cHJlc3NBcHBsaWNhdGlvbiB9IGZyb20gJ0BuZXN0anMvcGxhdGZvcm0tZXhwcmVzcyc7XG5pbXBvcnQgeyBBcHBNb2R1bGUgfSBmcm9tICcuL2FwcC9hcHAubW9kdWxlJztcbmltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSAnLi9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnQnO1xuXG5hc3luYyBmdW5jdGlvbiBib290c3RyYXAoKSB7XG4gIGNvbnN0IGFwcCA9IGF3YWl0IE5lc3RGYWN0b3J5LmNyZWF0ZTxOZXN0RXhwcmVzc0FwcGxpY2F0aW9uPihBcHBNb2R1bGUpO1xuICBhcHAudXNlU3RhdGljQXNzZXRzKCcuL3BhY2thZ2VzJywgeyBwcmVmaXg6ICcvYXBpL3BhY2thZ2VzJyB9KTtcbiAgY29uc3QgY29uZmlnU2VydmljZSA9IGFwcC5nZXQoQ29uZmlnU2VydmljZSk7XG4gIGNvbnN0IGhvc3QgPSBjb25maWdTZXJ2aWNlLmdldCgnQVBJX0hPU1QnKSB8fCAnMTI3LjAuMC4xJztcbiAgY29uc3QgcG9ydCA9IDMzMzM7XG4gIGNvbnN0IGdsb2JhbFByZWZpeCA9ICdhcGknO1xuXG4gIGFwcC5zZXRHbG9iYWxQcmVmaXgoZ2xvYmFsUHJlZml4KTtcbiAgYXBwLnVzZShqc29uKHsgbGltaXQ6ICc1MG1iJyB9KSk7XG5cbiAgLy8gRW5hYmxlIFN3YWdnZXItVUlcbiAgaWYgKCFlbnZpcm9ubWVudC5wcm9kdWN0aW9uKSB7XG4gICAgY29uc3QgY29uZmlnID0gbmV3IERvY3VtZW50QnVpbGRlcigpXG4gICAgICAuc2V0VGl0bGUoJ0lRQiBTdHVkaW8gTGl0ZScpXG4gICAgICAuc2V0RGVzY3JpcHRpb24oJ1RoZSBJUUIgU3R1ZGlvIExpdGUgQVBJIGRlc2NyaXB0aW9uIGFuZCB0cnktb3V0JylcbiAgICAgIC5zZXRWZXJzaW9uKGFwcC5nZXQoJ0FQUF9WRVJTSU9OJykpXG4gICAgICAuYWRkQmVhcmVyQXV0aCgpXG4gICAgICAuYnVpbGQoKTtcblxuICAgIGNvbnN0IGRvY3VtZW50ID0gU3dhZ2dlck1vZHVsZS5jcmVhdGVEb2N1bWVudChhcHAsIGNvbmZpZyk7XG4gICAgU3dhZ2dlck1vZHVsZS5zZXR1cCgnYXBpJywgYXBwLCBkb2N1bWVudCk7XG4gIH1cblxuICBhd2FpdCBhcHAubGlzdGVuKHBvcnQsIGhvc3QpO1xuICBMb2dnZXIubG9nKFxuICAgIGDwn5qAIEFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgb246IGh0dHA6Ly8ke2hvc3R9OiR7cG9ydH0vJHtnbG9iYWxQcmVmaXh9YFxuICApO1xufVxuXG5ib290c3RyYXAoKTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVZO0lBQUFBLGFBQUEsWUFBQUEsQ0FBQTtNQUFBLE9BQUFDLGNBQUE7SUFBQTtFQUFBO0VBQUEsT0FBQUEsY0FBQTtBQUFBO0FBQUFELGFBQUE7QUFmWixTQUFTRSxJQUFJLFFBQVEsU0FBUztBQUM5QixTQUFTQyxNQUFNLFFBQVEsZ0JBQWdCO0FBQ3ZDLFNBQVNDLGFBQWEsUUFBUSxnQkFBZ0I7QUFDOUMsU0FBU0MsV0FBVyxRQUFRLGNBQWM7QUFDMUMsU0FBU0MsZUFBZSxFQUFFQyxhQUFhLFFBQVEsaUJBQWlCO0FBRWhFLFNBQVNDLHNCQUFzQixRQUFRLDBCQUEwQjtBQUNqRSxTQUFTQyxTQUFTLFFBQVEsa0JBQWtCO0FBQzVDLFNBQVNDLFdBQVcsUUFBUSw0QkFBNEI7QUFFeEQsZUFBZUMsU0FBU0EsQ0FBQSxFQUFHO0VBQUFYLGFBQUEsR0FBQVksQ0FBQTtFQUN6QixNQUFNQyxHQUFHLElBQUFiLGFBQUEsR0FBQWMsQ0FBQSxPQUFHLE1BQU1ULFdBQVcsQ0FBQ1UsTUFBTSxDQUFDUCxzQkFBc0IsQ0FBQyxDQUFDQyxTQUFTLENBQUM7RUFBQ1QsYUFBQSxHQUFBYyxDQUFBO0VBQ3hFRCxHQUFHLENBQUNHLGVBQWUsQ0FBQyxZQUFZLEVBQUU7SUFBRUMsTUFBTSxFQUFFO0VBQWdCLENBQUMsQ0FBQztFQUM5RCxNQUFNQyxhQUFhLElBQUFsQixhQUFBLEdBQUFjLENBQUEsT0FBR0QsR0FBRyxDQUFDTSxHQUFHLENBQUNmLGFBQWEsQ0FBQztFQUM1QyxNQUFNZ0IsSUFBSSxJQUFBcEIsYUFBQSxHQUFBYyxDQUFBLE9BQUcsQ0FBQWQsYUFBQSxHQUFBcUIsQ0FBQSxVQUFBSCxhQUFhLENBQUNDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBQW5CLGFBQUEsR0FBQXFCLENBQUEsVUFBSSxXQUFXO0VBQ3pELE1BQU1DLElBQUksSUFBQXRCLGFBQUEsR0FBQWMsQ0FBQSxPQUFHLElBQUk7RUFDakIsTUFBTVMsWUFBWSxJQUFBdkIsYUFBQSxHQUFBYyxDQUFBLE9BQUcsS0FBSztFQUFDZCxhQUFBLEdBQUFjLENBQUE7RUFFM0JELEdBQUcsQ0FBQ1csZUFBZSxDQUFDRCxZQUFZLENBQUM7RUFBQ3ZCLGFBQUEsR0FBQWMsQ0FBQTtFQUNsQ0QsR0FBRyxDQUFDWSxHQUFHLENBQUN2QixJQUFJLENBQUM7SUFBRXdCLEtBQUssRUFBRTtFQUFPLENBQUMsQ0FBQyxDQUFDOztFQUVoQztFQUFBMUIsYUFBQSxHQUFBYyxDQUFBO0VBQ0EsSUFBSSxDQUFDSixXQUFXLENBQUNpQixVQUFVLEVBQUU7SUFBQTNCLGFBQUEsR0FBQXFCLENBQUE7SUFDM0IsTUFBTU8sTUFBTSxJQUFBNUIsYUFBQSxHQUFBYyxDQUFBLE9BQUcsSUFBSVIsZUFBZSxDQUFDLENBQUMsQ0FDakN1QixRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FDM0JDLGNBQWMsQ0FBQyxpREFBaUQsQ0FBQyxDQUNqRUMsVUFBVSxDQUFDbEIsR0FBRyxDQUFDTSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FDbENhLGFBQWEsQ0FBQyxDQUFDLENBQ2ZDLEtBQUssQ0FBQyxDQUFDO0lBRVYsTUFBTUMsUUFBUSxJQUFBbEMsYUFBQSxHQUFBYyxDQUFBLFFBQUdQLGFBQWEsQ0FBQzRCLGNBQWMsQ0FBQ3RCLEdBQUcsRUFBRWUsTUFBTSxDQUFDO0lBQUM1QixhQUFBLEdBQUFjLENBQUE7SUFDM0RQLGFBQWEsQ0FBQzZCLEtBQUssQ0FBQyxLQUFLLEVBQUV2QixHQUFHLEVBQUVxQixRQUFRLENBQUM7RUFDM0MsQ0FBQztJQUFBbEMsYUFBQSxHQUFBcUIsQ0FBQTtFQUFBO0VBQUFyQixhQUFBLEdBQUFjLENBQUE7RUFFRCxNQUFNRCxHQUFHLENBQUN3QixNQUFNLENBQUNmLElBQUksRUFBRUYsSUFBSSxDQUFDO0VBQUNwQixhQUFBLEdBQUFjLENBQUE7RUFDN0JYLE1BQU0sQ0FBQ21DLEdBQUcsQ0FDUix3Q0FBd0NsQixJQUFJLElBQUlFLElBQUksSUFBSUMsWUFBWSxFQUN0RSxDQUFDO0FBQ0g7QUFBQ3ZCLGFBQUEsR0FBQWMsQ0FBQTtBQUVESCxTQUFTLENBQUMsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==