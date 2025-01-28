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
import {
  HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient, HttpClient
} from '@angular/common/http';
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
const hash = (str: string) => str.split('').reduce((prev, curr) => Math.imul(31, prev) + curr.charCodeAt(0) | 0, 0);

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', `.json?v=${Math.abs(hash(new Date().toISOString()))}`);
}
if (environment.production) {
  enableProdMode();
}

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
    }), MatCheckboxModule, MatSelectModule, FormsModule),
    BackendService,
    MatDialog,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'de'
    },
    {
      provide: DateAdapter,
      useClass: DateFnsAdapter,
      useValue: [MAT_DATE_LOCALE]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: 'SERVER_URL',
      useValue: environment.backendUrl
    },
    {
      provide: 'APP_PUBLISHER',
      useValue: 'IQB - Institut zur Qualitätsentwicklung im Bildungswesen'
    },
    {
      provide: 'APP_NAME',
      useValue: 'Studio'
    },
    {
      provide: 'APP_VERSION',
      useValue: '9.5.0'
    },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ]
})
  // eslint-disable-next-line no-console
  .catch(err => console.log(err));
