function cov_t7x1pw6km() {
  var path = "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/main.ts";
  var hash = "cde0f1e5e4ecb95641384c3f972aeaef51b19212";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/home/yan/Desktop/repo/studio-lite/apps/frontend/src/main.ts",
    statementMap: {
      "0": {
        start: {
          line: 39,
          column: 13
        },
        end: {
          line: 39,
          column: 115
        }
      },
      "1": {
        start: {
          line: 39,
          column: 30
        },
        end: {
          line: 39,
          column: 115
        }
      },
      "2": {
        start: {
          line: 39,
          column: 67
        },
        end: {
          line: 39,
          column: 111
        }
      },
      "3": {
        start: {
          line: 42,
          column: 2
        },
        end: {
          line: 42,
          column: 112
        }
      },
      "4": {
        start: {
          line: 44,
          column: 0
        },
        end: {
          line: 46,
          column: 1
        }
      },
      "5": {
        start: {
          line: 45,
          column: 2
        },
        end: {
          line: 45,
          column: 19
        }
      },
      "6": {
        start: {
          line: 48,
          column: 0
        },
        end: {
          line: 100,
          column: 34
        }
      },
      "7": {
        start: {
          line: 100,
          column: 16
        },
        end: {
          line: 100,
          column: 32
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 39,
            column: 13
          },
          end: {
            line: 39,
            column: 14
          }
        },
        loc: {
          start: {
            line: 39,
            column: 30
          },
          end: {
            line: 39,
            column: 115
          }
        },
        line: 39
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 39,
            column: 51
          },
          end: {
            line: 39,
            column: 52
          }
        },
        loc: {
          start: {
            line: 39,
            column: 67
          },
          end: {
            line: 39,
            column: 111
          }
        },
        line: 39
      },
      "2": {
        name: "createTranslateLoader",
        decl: {
          start: {
            line: 41,
            column: 16
          },
          end: {
            line: 41,
            column: 37
          }
        },
        loc: {
          start: {
            line: 41,
            column: 56
          },
          end: {
            line: 43,
            column: 1
          }
        },
        line: 41
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 100,
            column: 9
          },
          end: {
            line: 100,
            column: 10
          }
        },
        loc: {
          start: {
            line: 100,
            column: 16
          },
          end: {
            line: 100,
            column: 32
          }
        },
        line: 100
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 44,
            column: 0
          },
          end: {
            line: 46,
            column: 1
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 44,
            column: 0
          },
          end: {
            line: 46,
            column: 1
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
        line: 44
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
      "7": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0
    },
    b: {
      "0": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "cde0f1e5e4ecb95641384c3f972aeaef51b19212"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_t7x1pw6km = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_t7x1pw6km();
import { enableProdMode, ApplicationModule, importProvidersFrom } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { IqbComponentsModule } from '@studio-lite-lib/iqb-components';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient, HttpClient } from '@angular/common/http';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { AuthModule } from './app/modules/auth/auth.module';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { BackendService } from './app/services/backend.service';

// eslint-disable-next-line no-bitwise
cov_t7x1pw6km().s[0]++;
const hash = (str: string) => {
  cov_t7x1pw6km().f[0]++;
  cov_t7x1pw6km().s[1]++;
  return str.split('').reduce((prev, curr) => {
    cov_t7x1pw6km().f[1]++;
    cov_t7x1pw6km().s[2]++;
    return Math.imul(31, prev) + curr.charCodeAt(0) | 0;
  }, 0);
};
export function createTranslateLoader(http: HttpClient) {
  cov_t7x1pw6km().f[2]++;
  cov_t7x1pw6km().s[3]++;
  return new TranslateHttpLoader(http, './assets/i18n/', `.json?v=${Math.abs(hash(new Date().toISOString()))}`);
}
cov_t7x1pw6km().s[4]++;
if (environment.production) {
  cov_t7x1pw6km().b[0][0]++;
  cov_t7x1pw6km().s[5]++;
  enableProdMode();
} else {
  cov_t7x1pw6km().b[0][1]++;
}
cov_t7x1pw6km().s[6]++;
bootstrapApplication(AppComponent, {
  providers: [
  // eslint-disable-next-line max-len
  importProvidersFrom(AuthModule, ApplicationModule, BrowserModule, MatButtonModule, MatFormFieldModule, MatMenuModule, MatToolbarModule, MatIconModule, MatInputModule, MatTooltipModule, MatDialogModule, MatCardModule, MatIconModule, MatTabsModule, MatTableModule, ReactiveFormsModule, MatProgressSpinnerModule, MatSnackBarModule, RouterModule, ReactiveFormsModule, AppRoutingModule, IqbComponentsModule.forRoot(), TranslateModule.forRoot({
    defaultLanguage: 'de',
    loader: {
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [HttpClient]
    }
  }), MatCheckboxModule, MatSelectModule, FormsModule), BackendService, MatDialog, {
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }, {
    provide: MAT_DATE_LOCALE,
    useValue: 'de'
  }, {
    provide: DateAdapter,
    useClass: DateFnsAdapter,
    useValue: [MAT_DATE_LOCALE]
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }, {
    provide: 'SERVER_URL',
    useValue: environment.backendUrl
  }, {
    provide: 'APP_PUBLISHER',
    useValue: 'IQB - Institut zur Qualitätsentwicklung im Bildungswesen'
  }, {
    provide: 'APP_NAME',
    useValue: 'Studio'
  }, {
    provide: 'APP_VERSION',
    useValue: '12.2.1'
  }, provideAnimations(), provideHttpClient(withInterceptorsFromDi())]
})
// eslint-disable-next-line no-console
.catch(err => {
  cov_t7x1pw6km().f[3]++;
  cov_t7x1pw6km().s[7]++;
  return console.log(err);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfdDd4MXB3NmttIiwiYWN0dWFsQ292ZXJhZ2UiLCJlbmFibGVQcm9kTW9kZSIsIkFwcGxpY2F0aW9uTW9kdWxlIiwiaW1wb3J0UHJvdmlkZXJzRnJvbSIsIk1hdFNlbGVjdE1vZHVsZSIsIk1hdENoZWNrYm94TW9kdWxlIiwiVHJhbnNsYXRlTW9kdWxlIiwiVHJhbnNsYXRlTG9hZGVyIiwiSXFiQ29tcG9uZW50c01vZHVsZSIsIlJvdXRlck1vZHVsZSIsIk1hdFNuYWNrQmFyTW9kdWxlIiwiTWF0UHJvZ3Jlc3NTcGlubmVyTW9kdWxlIiwiUmVhY3RpdmVGb3Jtc01vZHVsZSIsIkZvcm1zTW9kdWxlIiwiTWF0VGFibGVNb2R1bGUiLCJNYXRUYWJzTW9kdWxlIiwiTWF0Q2FyZE1vZHVsZSIsIk1hdFRvb2x0aXBNb2R1bGUiLCJNYXRJbnB1dE1vZHVsZSIsIk1hdEljb25Nb2R1bGUiLCJNYXRUb29sYmFyTW9kdWxlIiwiTWF0TWVudU1vZHVsZSIsIk1hdEZvcm1GaWVsZE1vZHVsZSIsIk1hdEJ1dHRvbk1vZHVsZSIsInByb3ZpZGVBbmltYXRpb25zIiwiQnJvd3Nlck1vZHVsZSIsImJvb3RzdHJhcEFwcGxpY2F0aW9uIiwiSFRUUF9JTlRFUkNFUFRPUlMiLCJ3aXRoSW50ZXJjZXB0b3JzRnJvbURpIiwicHJvdmlkZUh0dHBDbGllbnQiLCJIdHRwQ2xpZW50IiwiRGF0ZUZuc0FkYXB0ZXIiLCJNQVRfREFURV9MT0NBTEUiLCJEYXRlQWRhcHRlciIsIkxvY2F0aW9uU3RyYXRlZ3kiLCJIYXNoTG9jYXRpb25TdHJhdGVneSIsIk1hdERpYWxvZyIsIk1hdERpYWxvZ01vZHVsZSIsIlRyYW5zbGF0ZUh0dHBMb2FkZXIiLCJBdXRoSW50ZXJjZXB0b3IiLCJBdXRoTW9kdWxlIiwiQXBwUm91dGluZ01vZHVsZSIsIkFwcENvbXBvbmVudCIsImVudmlyb25tZW50IiwiQmFja2VuZFNlcnZpY2UiLCJzIiwiaGFzaCIsInN0ciIsImYiLCJzcGxpdCIsInJlZHVjZSIsInByZXYiLCJjdXJyIiwiTWF0aCIsImltdWwiLCJjaGFyQ29kZUF0IiwiY3JlYXRlVHJhbnNsYXRlTG9hZGVyIiwiaHR0cCIsImFicyIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInByb2R1Y3Rpb24iLCJiIiwicHJvdmlkZXJzIiwiZm9yUm9vdCIsImRlZmF1bHRMYW5ndWFnZSIsImxvYWRlciIsInByb3ZpZGUiLCJ1c2VGYWN0b3J5IiwiZGVwcyIsInVzZUNsYXNzIiwidXNlVmFsdWUiLCJtdWx0aSIsImJhY2tlbmRVcmwiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJsb2ciXSwic291cmNlcyI6WyJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVuYWJsZVByb2RNb2RlLCBBcHBsaWNhdGlvbk1vZHVsZSwgaW1wb3J0UHJvdmlkZXJzRnJvbSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBNYXRTZWxlY3RNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zZWxlY3QnO1xuaW1wb3J0IHsgTWF0Q2hlY2tib3hNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jaGVja2JveCc7XG5pbXBvcnQgeyBUcmFuc2xhdGVNb2R1bGUsIFRyYW5zbGF0ZUxvYWRlciB9IGZyb20gJ0BuZ3gtdHJhbnNsYXRlL2NvcmUnO1xuaW1wb3J0IHsgSXFiQ29tcG9uZW50c01vZHVsZSB9IGZyb20gJ0BzdHVkaW8tbGl0ZS1saWIvaXFiLWNvbXBvbmVudHMnO1xuaW1wb3J0IHsgUm91dGVyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IE1hdFNuYWNrQmFyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc25hY2stYmFyJztcbmltcG9ydCB7IE1hdFByb2dyZXNzU3Bpbm5lck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3Byb2dyZXNzLXNwaW5uZXInO1xuaW1wb3J0IHsgUmVhY3RpdmVGb3Jtc01vZHVsZSwgRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBNYXRUYWJsZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3RhYmxlJztcbmltcG9ydCB7IE1hdFRhYnNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90YWJzJztcbmltcG9ydCB7IE1hdENhcmRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jYXJkJztcbmltcG9ydCB7IE1hdFRvb2x0aXBNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90b29sdGlwJztcbmltcG9ydCB7IE1hdElucHV0TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaW5wdXQnO1xuaW1wb3J0IHsgTWF0SWNvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2ljb24nO1xuaW1wb3J0IHsgTWF0VG9vbGJhck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3Rvb2xiYXInO1xuaW1wb3J0IHsgTWF0TWVudU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL21lbnUnO1xuaW1wb3J0IHsgTWF0Rm9ybUZpZWxkTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZm9ybS1maWVsZCc7XG5pbXBvcnQgeyBNYXRCdXR0b25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xuaW1wb3J0IHsgcHJvdmlkZUFuaW1hdGlvbnMgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHsgQnJvd3Nlck1vZHVsZSwgYm9vdHN0cmFwQXBwbGljYXRpb24gfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7XG4gIEhUVFBfSU5URVJDRVBUT1JTLCB3aXRoSW50ZXJjZXB0b3JzRnJvbURpLCBwcm92aWRlSHR0cENsaWVudCwgSHR0cENsaWVudFxufSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBEYXRlRm5zQWRhcHRlciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsLWRhdGUtZm5zLWFkYXB0ZXInO1xuaW1wb3J0IHsgTUFUX0RBVEVfTE9DQUxFLCBEYXRlQWRhcHRlciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHsgTG9jYXRpb25TdHJhdGVneSwgSGFzaExvY2F0aW9uU3RyYXRlZ3kgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTWF0RGlhbG9nLCBNYXREaWFsb2dNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgVHJhbnNsYXRlSHR0cExvYWRlciB9IGZyb20gJ0BuZ3gtdHJhbnNsYXRlL2h0dHAtbG9hZGVyJztcbmltcG9ydCB7IEF1dGhJbnRlcmNlcHRvciB9IGZyb20gJy4vYXBwL2ludGVyY2VwdG9ycy9hdXRoLmludGVyY2VwdG9yJztcbmltcG9ydCB7IEF1dGhNb2R1bGUgfSBmcm9tICcuL2FwcC9tb2R1bGVzL2F1dGgvYXV0aC5tb2R1bGUnO1xuaW1wb3J0IHsgQXBwUm91dGluZ01vZHVsZSB9IGZyb20gJy4vYXBwL2FwcC1yb3V0aW5nLm1vZHVsZSc7XG5pbXBvcnQgeyBBcHBDb21wb25lbnQgfSBmcm9tICcuL2FwcC9hcHAuY29tcG9uZW50JztcbmltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSAnLi9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgQmFja2VuZFNlcnZpY2UgfSBmcm9tICcuL2FwcC9zZXJ2aWNlcy9iYWNrZW5kLnNlcnZpY2UnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuY29uc3QgaGFzaCA9IChzdHI6IHN0cmluZykgPT4gc3RyLnNwbGl0KCcnKS5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IE1hdGguaW11bCgzMSwgcHJldikgKyBjdXJyLmNoYXJDb2RlQXQoMCkgfCAwLCAwKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYW5zbGF0ZUxvYWRlcihodHRwOiBIdHRwQ2xpZW50KSB7XG4gIHJldHVybiBuZXcgVHJhbnNsYXRlSHR0cExvYWRlcihodHRwLCAnLi9hc3NldHMvaTE4bi8nLCBgLmpzb24/dj0ke01hdGguYWJzKGhhc2gobmV3IERhdGUoKS50b0lTT1N0cmluZygpKSl9YCk7XG59XG5pZiAoZW52aXJvbm1lbnQucHJvZHVjdGlvbikge1xuICBlbmFibGVQcm9kTW9kZSgpO1xufVxuXG5ib290c3RyYXBBcHBsaWNhdGlvbihBcHBDb21wb25lbnQsIHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1sZW5cbiAgICBpbXBvcnRQcm92aWRlcnNGcm9tKEF1dGhNb2R1bGUsIEFwcGxpY2F0aW9uTW9kdWxlLCBCcm93c2VyTW9kdWxlLCBNYXRCdXR0b25Nb2R1bGUsIE1hdEZvcm1GaWVsZE1vZHVsZSwgTWF0TWVudU1vZHVsZSwgTWF0VG9vbGJhck1vZHVsZSwgTWF0SWNvbk1vZHVsZSwgTWF0SW5wdXRNb2R1bGUsIE1hdFRvb2x0aXBNb2R1bGUsIE1hdERpYWxvZ01vZHVsZSwgTWF0Q2FyZE1vZHVsZSwgTWF0SWNvbk1vZHVsZSwgTWF0VGFic01vZHVsZSwgTWF0VGFibGVNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUsIE1hdFByb2dyZXNzU3Bpbm5lck1vZHVsZSwgTWF0U25hY2tCYXJNb2R1bGUsIFJvdXRlck1vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSwgQXBwUm91dGluZ01vZHVsZSwgSXFiQ29tcG9uZW50c01vZHVsZS5mb3JSb290KCksIFRyYW5zbGF0ZU1vZHVsZS5mb3JSb290KHtcbiAgICAgIGRlZmF1bHRMYW5ndWFnZTogJ2RlJyxcbiAgICAgIGxvYWRlcjoge1xuICAgICAgICBwcm92aWRlOiBUcmFuc2xhdGVMb2FkZXIsXG4gICAgICAgIHVzZUZhY3Rvcnk6IGNyZWF0ZVRyYW5zbGF0ZUxvYWRlcixcbiAgICAgICAgZGVwczogW0h0dHBDbGllbnRdXG4gICAgICB9XG4gICAgfSksIE1hdENoZWNrYm94TW9kdWxlLCBNYXRTZWxlY3RNb2R1bGUsIEZvcm1zTW9kdWxlKSxcbiAgICBCYWNrZW5kU2VydmljZSxcbiAgICBNYXREaWFsb2csXG4gICAge1xuICAgICAgcHJvdmlkZTogTG9jYXRpb25TdHJhdGVneSxcbiAgICAgIHVzZUNsYXNzOiBIYXNoTG9jYXRpb25TdHJhdGVneVxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogTUFUX0RBVEVfTE9DQUxFLFxuICAgICAgdXNlVmFsdWU6ICdkZSdcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IERhdGVBZGFwdGVyLFxuICAgICAgdXNlQ2xhc3M6IERhdGVGbnNBZGFwdGVyLFxuICAgICAgdXNlVmFsdWU6IFtNQVRfREFURV9MT0NBTEVdXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgIHVzZUNsYXNzOiBBdXRoSW50ZXJjZXB0b3IsXG4gICAgICBtdWx0aTogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogJ1NFUlZFUl9VUkwnLFxuICAgICAgdXNlVmFsdWU6IGVudmlyb25tZW50LmJhY2tlbmRVcmxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6ICdBUFBfUFVCTElTSEVSJyxcbiAgICAgIHVzZVZhbHVlOiAnSVFCIC0gSW5zdGl0dXQgenVyIFF1YWxpdMOkdHNlbnR3aWNrbHVuZyBpbSBCaWxkdW5nc3dlc2VuJ1xuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogJ0FQUF9OQU1FJyxcbiAgICAgIHVzZVZhbHVlOiAnU3R1ZGlvJ1xuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogJ0FQUF9WRVJTSU9OJyxcbiAgICAgIHVzZVZhbHVlOiAnMTIuMi4xJ1xuICAgIH0sXG4gICAgcHJvdmlkZUFuaW1hdGlvbnMoKSxcbiAgICBwcm92aWRlSHR0cENsaWVudCh3aXRoSW50ZXJjZXB0b3JzRnJvbURpKCkpXG4gIF1cbn0pXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gIC5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlWTtJQUFBQSxhQUFBLFlBQUFBLENBQUE7TUFBQSxPQUFBQyxjQUFBO0lBQUE7RUFBQTtFQUFBLE9BQUFBLGNBQUE7QUFBQTtBQUFBRCxhQUFBO0FBZlosU0FBU0UsY0FBYyxFQUFFQyxpQkFBaUIsRUFBRUMsbUJBQW1CLFFBQVEsZUFBZTtBQUV0RixTQUFTQyxlQUFlLFFBQVEsMEJBQTBCO0FBQzFELFNBQVNDLGlCQUFpQixRQUFRLDRCQUE0QjtBQUM5RCxTQUFTQyxlQUFlLEVBQUVDLGVBQWUsUUFBUSxxQkFBcUI7QUFDdEUsU0FBU0MsbUJBQW1CLFFBQVEsaUNBQWlDO0FBQ3JFLFNBQVNDLFlBQVksUUFBUSxpQkFBaUI7QUFDOUMsU0FBU0MsaUJBQWlCLFFBQVEsNkJBQTZCO0FBQy9ELFNBQVNDLHdCQUF3QixRQUFRLG9DQUFvQztBQUM3RSxTQUFTQyxtQkFBbUIsRUFBRUMsV0FBVyxRQUFRLGdCQUFnQjtBQUNqRSxTQUFTQyxjQUFjLFFBQVEseUJBQXlCO0FBQ3hELFNBQVNDLGFBQWEsUUFBUSx3QkFBd0I7QUFDdEQsU0FBU0MsYUFBYSxRQUFRLHdCQUF3QjtBQUN0RCxTQUFTQyxnQkFBZ0IsUUFBUSwyQkFBMkI7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QUVELGlCQUFpQixFQUFFRCxZQUFZLEVBQUVHLG1CQUFtQixFQUFFNkIsZ0JBQWdCLEVBQUVqQyxtQkFBbUIsQ0FBQ3dELE9BQU8sQ0FBQyxDQUFDLEVBQUUxRCxlQUFlLENBQUMwRCxPQUFPLENBQUM7SUFDbmJDLGVBQWUsRUFBRSxJQUFJO0lBQ3JCQyxNQUFNLEVBQUU7TUFDTkMsT0FBTyxFQUFFNUQsZUFBZTtNQUN4QjZELFVBQVUsRUFBRVoscUJBQXFCO01BQ2pDYSxJQUFJLEVBQUUsQ0FBQ3ZDLFVBQVU7SUFDbkI7RUFDRixDQUFDLENBQUMsRUFBRXpCLGlCQUFpQixFQUFFRCxlQUFlLEVBQUVTLFdBQVcsQ0FBQyxFQUNwRCtCLGNBQWMsRUFDZFIsU0FBUyxFQUNUO0lBQ0UrQixPQUFPLEVBQUVqQyxnQkFBZ0I7SUFDekJvQyxRQUFRLEVBQUVuQztFQUNaLENBQUMsRUFDRDtJQUNFZ0MsT0FBTyxFQUFFbkMsZUFBZTtJQUN4QnVDLFFBQVEsRUFBRTtFQUNaLENBQUMsRUFDRDtJQUNFSixPQUFPLEVBQUVsQyxXQUFXO0lBQ3BCcUMsUUFBUSxFQUFFdkMsY0FBYztJQUN4QndDLFFBQVEsRUFBRSxDQUFDdkMsZUFBZTtFQUM1QixDQUFDLEVBQ0Q7SUFDRW1DLE9BQU8sRUFBRXhDLGlCQUFpQjtJQUMxQjJDLFFBQVEsRUFBRS9CLGVBQWU7SUFDekJpQyxLQUFLLEVBQUU7RUFDVCxDQUFDLEVBQ0Q7SUFDRUwsT0FBTyxFQUFFLFlBQVk7SUFDckJJLFFBQVEsRUFBRTVCLFdBQVcsQ0FBQzhCO0VBQ3hCLENBQUMsRUFDRDtJQUNFTixPQUFPLEVBQUUsZUFBZTtJQUN4QkksUUFBUSxFQUFFO0VBQ1osQ0FBQyxFQUNEO0lBQ0VKLE9BQU8sRUFBRSxVQUFVO0lBQ25CSSxRQUFRLEVBQUU7RUFDWixDQUFDLEVBQ0Q7SUFDRUosT0FBTyxFQUFFLGFBQWE7SUFDdEJJLFFBQVEsRUFBRTtFQUNaLENBQUMsRUFDRC9DLGlCQUFpQixDQUFDLENBQUMsRUFDbkJLLGlCQUFpQixDQUFDRCxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7QUFFL0MsQ0FBQztBQUNDO0FBQUEsQ0FDQzhDLEtBQUssQ0FBQ0MsR0FBRyxJQUFJO0VBQUE1RSxhQUFBLEdBQUFpRCxDQUFBO0VBQUFqRCxhQUFBLEdBQUE4QyxDQUFBO0VBQUEsT0FBQStCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDRixHQUFHLENBQUM7QUFBRCxDQUFDLENBQUMiLCJpZ25vcmVMaXN0IjpbXX0=