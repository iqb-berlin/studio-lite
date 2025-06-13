function cov_ffeyea0o7() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/auth/keycloak-initializer.ts";
  var hash = "c65577465b7e89cfa62a8a640ab152e9bebfb705";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/app/modules/auth/keycloak-initializer.ts",
    statementMap: {
      "0": {
        start: {
          line: 5,
          column: 2
        },
        end: {
          line: 22,
          column: 3
        }
      },
      "1": {
        start: {
          line: 6,
          column: 37
        },
        end: {
          line: 19,
          column: 5
        }
      },
      "2": {
        start: {
          line: 21,
          column: 4
        },
        end: {
          line: 21,
          column: 40
        }
      },
      "3": {
        start: {
          line: 21,
          column: 17
        },
        end: {
          line: 21,
          column: 39
        }
      },
      "4": {
        start: {
          line: 23,
          column: 35
        },
        end: {
          line: 36,
          column: 3
        }
      },
      "5": {
        start: {
          line: 38,
          column: 2
        },
        end: {
          line: 38,
          column: 38
        }
      },
      "6": {
        start: {
          line: 38,
          column: 15
        },
        end: {
          line: 38,
          column: 37
        }
      }
    },
    fnMap: {
      "0": {
        name: "initializer",
        decl: {
          start: {
            line: 4,
            column: 16
          },
          end: {
            line: 4,
            column: 27
          }
        },
        loc: {
          start: {
            line: 4,
            column: 79
          },
          end: {
            line: 39,
            column: 1
          }
        },
        line: 4
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 21,
            column: 11
          },
          end: {
            line: 21,
            column: 12
          }
        },
        loc: {
          start: {
            line: 21,
            column: 17
          },
          end: {
            line: 21,
            column: 39
          }
        },
        line: 21
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 38,
            column: 9
          },
          end: {
            line: 38,
            column: 10
          }
        },
        loc: {
          start: {
            line: 38,
            column: 15
          },
          end: {
            line: 38,
            column: 37
          }
        },
        line: 38
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 5,
            column: 2
          },
          end: {
            line: 22,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 5,
            column: 2
          },
          end: {
            line: 22,
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
        line: 5
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
      "1": 0,
      "2": 0
    },
    b: {
      "0": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "c65577465b7e89cfa62a8a640ab152e9bebfb705"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_ffeyea0o7 = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_ffeyea0o7();
import { KeycloakOptions, KeycloakService } from 'keycloak-angular';
import { environment } from '../../../environments/environment';
export function initializer(keycloak: KeycloakService): () => Promise<boolean> {
  cov_ffeyea0o7().f[0]++;
  cov_ffeyea0o7().s[0]++;
  if (environment.production) {
    cov_ffeyea0o7().b[0][0]++;
    const options: KeycloakOptions = (cov_ffeyea0o7().s[1]++, {
      config: {
        url: 'https://www.iqb-login.de',
        realm: 'iqb',
        clientId: 'studio'
      },
      loadUserProfileAtStartUp: true,
      initOptions: {
        onLoad: 'check-sso',
        // onLoad: 'login-required',
        checkLoginIframe: false
      },
      bearerExcludedUrls: []
    });
    cov_ffeyea0o7().s[2]++;
    return () => {
      cov_ffeyea0o7().f[1]++;
      cov_ffeyea0o7().s[3]++;
      return keycloak.init(options);
    };
  } else {
    cov_ffeyea0o7().b[0][1]++;
  }
  const options: KeycloakOptions = (cov_ffeyea0o7().s[4]++, {
    config: {
      url: 'https://www.iqb-login.de',
      realm: 'iqb',
      clientId: 'studio'
    },
    loadUserProfileAtStartUp: true,
    initOptions: {
      onLoad: 'check-sso',
      // onLoad: 'login-required',
      checkLoginIframe: false
    },
    bearerExcludedUrls: []
  });
  cov_ffeyea0o7().s[5]++;
  return () => {
    cov_ffeyea0o7().f[2]++;
    cov_ffeyea0o7().s[6]++;
    return keycloak.init(options);
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfZmZleWVhMG83IiwiYWN0dWFsQ292ZXJhZ2UiLCJLZXljbG9ha09wdGlvbnMiLCJLZXljbG9ha1NlcnZpY2UiLCJlbnZpcm9ubWVudCIsImluaXRpYWxpemVyIiwia2V5Y2xvYWsiLCJQcm9taXNlIiwiZiIsInMiLCJwcm9kdWN0aW9uIiwiYiIsIm9wdGlvbnMiLCJjb25maWciLCJ1cmwiLCJyZWFsbSIsImNsaWVudElkIiwibG9hZFVzZXJQcm9maWxlQXRTdGFydFVwIiwiaW5pdE9wdGlvbnMiLCJvbkxvYWQiLCJjaGVja0xvZ2luSWZyYW1lIiwiYmVhcmVyRXhjbHVkZWRVcmxzIiwiaW5pdCJdLCJzb3VyY2VzIjpbImtleWNsb2FrLWluaXRpYWxpemVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEtleWNsb2FrT3B0aW9ucywgS2V5Y2xvYWtTZXJ2aWNlIH0gZnJvbSAna2V5Y2xvYWstYW5ndWxhcic7XG5pbXBvcnQgeyBlbnZpcm9ubWVudCB9IGZyb20gJy4uLy4uLy4uL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplcihrZXljbG9hazogS2V5Y2xvYWtTZXJ2aWNlKTogKCkgPT4gUHJvbWlzZTxib29sZWFuPiB7XG4gIGlmIChlbnZpcm9ubWVudC5wcm9kdWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9uczogS2V5Y2xvYWtPcHRpb25zID0ge1xuICAgICAgY29uZmlnOiB7XG4gICAgICAgIHVybDogJ2h0dHBzOi8vd3d3LmlxYi1sb2dpbi5kZScsXG4gICAgICAgIHJlYWxtOiAnaXFiJyxcbiAgICAgICAgY2xpZW50SWQ6ICdzdHVkaW8nXG4gICAgICB9LFxuICAgICAgbG9hZFVzZXJQcm9maWxlQXRTdGFydFVwOiB0cnVlLFxuICAgICAgaW5pdE9wdGlvbnM6IHtcbiAgICAgICAgb25Mb2FkOiAnY2hlY2stc3NvJyxcbiAgICAgICAgLy8gb25Mb2FkOiAnbG9naW4tcmVxdWlyZWQnLFxuICAgICAgICBjaGVja0xvZ2luSWZyYW1lOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGJlYXJlckV4Y2x1ZGVkVXJsczogW11cbiAgICB9O1xuXG4gICAgcmV0dXJuICgpID0+IGtleWNsb2FrLmluaXQob3B0aW9ucyk7XG4gIH1cbiAgY29uc3Qgb3B0aW9uczogS2V5Y2xvYWtPcHRpb25zID0ge1xuICAgIGNvbmZpZzoge1xuICAgICAgdXJsOiAnaHR0cHM6Ly93d3cuaXFiLWxvZ2luLmRlJyxcbiAgICAgIHJlYWxtOiAnaXFiJyxcbiAgICAgIGNsaWVudElkOiAnc3R1ZGlvJ1xuICAgIH0sXG4gICAgbG9hZFVzZXJQcm9maWxlQXRTdGFydFVwOiB0cnVlLFxuICAgIGluaXRPcHRpb25zOiB7XG4gICAgICBvbkxvYWQ6ICdjaGVjay1zc28nLFxuICAgICAgLy8gb25Mb2FkOiAnbG9naW4tcmVxdWlyZWQnLFxuICAgICAgY2hlY2tMb2dpbklmcmFtZTogZmFsc2VcbiAgICB9LFxuICAgIGJlYXJlckV4Y2x1ZGVkVXJsczogW11cbiAgfTtcblxuICByZXR1cm4gKCkgPT4ga2V5Y2xvYWsuaW5pdChvcHRpb25zKTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVZO0lBQUFBLGFBQUEsWUFBQUEsQ0FBQTtNQUFBLE9BQUFDLGNBQUE7SUFBQTtFQUFBO0VBQUEsT0FBQUEsY0FBQTtBQUFBO0FBQUFELGFBQUE7QUFmWixTQUFTRSxlQUFlLEVBQUVDLGVBQWUsUUFBUSxrQkFBa0I7QUFDbkUsU0FBU0MsV0FBVyxRQUFRLG1DQUFtQztBQUUvRCxPQUFPLFNBQVNDLFdBQVdBLENBQUNDLFFBQVEsRUFBRUgsZUFBZSxDQUFDLEVBQUUsR0FBRyxHQUFHSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7RUFBQVAsYUFBQSxHQUFBUSxDQUFBO0VBQUFSLGFBQUEsR0FBQVMsQ0FBQTtFQUM3RSxJQUFJTCxXQUFXLENBQUNNLFVBQVUsRUFBRTtJQUFBVixhQUFBLEdBQUFXLENBQUE7SUFDMUIsTUFBTUMsT0FBTyxFQUFFVixlQUFlLElBQUFGLGFBQUEsR0FBQVMsQ0FBQSxPQUFHO01BQy9CSSxNQUFNLEVBQUU7UUFDTkMsR0FBRyxFQUFFLDBCQUEwQjtRQUMvQkMsS0FBSyxFQUFFLEtBQUs7UUFDWkMsUUFBUSxFQUFFO01BQ1osQ0FBQztNQUNEQyx3QkFBd0IsRUFBRSxJQUFJO01BQzlCQyxXQUFXLEVBQUU7UUFDWEMsTUFBTSxFQUFFLFdBQVc7UUFDbkI7UUFDQUMsZ0JBQWdCLEVBQUU7TUFDcEIsQ0FBQztNQUNEQyxrQkFBa0IsRUFBRTtJQUN0QixDQUFDO0lBQUNyQixhQUFBLEdBQUFTLENBQUE7SUFFRixPQUFPLE1BQU07TUFBQVQsYUFBQSxHQUFBUSxDQUFBO01BQUFSLGFBQUEsR0FBQVMsQ0FBQTtNQUFBLE9BQUFILFFBQVEsQ0FBQ2dCLElBQUksQ0FBQ1YsT0FBTyxDQUFDO0lBQUQsQ0FBQztFQUNyQyxDQUFDO0lBQUFaLGFBQUEsR0FBQVcsQ0FBQTtFQUFBO0VBQ0QsTUFBTUMsT0FBTyxFQUFFVixlQUFlLElBQUFGLGFBQUEsR0FBQVMsQ0FBQSxPQUFHO0lBQy9CSSxNQUFNLEVBQUU7TUFDTkMsR0FBRyxFQUFFLDBCQUEwQjtNQUMvQkMsS0FBSyxFQUFFLEtBQUs7TUFDWkMsUUFBUSxFQUFFO0lBQ1osQ0FBQztJQUNEQyx3QkFBd0IsRUFBRSxJQUFJO0lBQzlCQyxXQUFXLEVBQUU7TUFDWEMsTUFBTSxFQUFFLFdBQVc7TUFDbkI7TUFDQUMsZ0JBQWdCLEVBQUU7SUFDcEIsQ0FBQztJQUNEQyxrQkFBa0IsRUFBRTtFQUN0QixDQUFDO0VBQUNyQixhQUFBLEdBQUFTLENBQUE7RUFFRixPQUFPLE1BQU07SUFBQVQsYUFBQSxHQUFBUSxDQUFBO0lBQUFSLGFBQUEsR0FBQVMsQ0FBQTtJQUFBLE9BQUFILFFBQVEsQ0FBQ2dCLElBQUksQ0FBQ1YsT0FBTyxDQUFDO0VBQUQsQ0FBQztBQUNyQyIsImlnbm9yZUxpc3QiOltdfQ==