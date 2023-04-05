import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { NgModule, ApplicationModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IqbComponentsModule } from '@studio-lite-lib/iqb-components';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { StudioComponentsModule } from '@studio-lite/studio-components';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { BackendService } from './backend.service';
import { AboutComponent } from './components/about.component';
import { HomeComponent } from './components/home.component';
import { ChangePasswordComponent } from './components/change-password.component';
import { AuthInterceptor } from './auth.interceptor';
import { RequestMessageDialogComponent } from './dialogs/request-message-dialog.component';
import { InputTextComponent } from './dialogs/input-text.component';
import { EditMyDataComponent } from './components/edit-my-data.component';
import { EditWorkspaceSettingsComponent } from './dialogs/edit-workspace-settings.component';
import { UserWorkspacesGroupsComponent } from './components/user-workspaces-groups/user-workspaces-groups.component';
import { LoginComponent } from './components/login/login.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { AccountActionComponent } from './components/account-action/account-action.component';
import { ChangePasswordDirective } from './components/account-action/change-password.directive';
import { EditMyDataDirective } from './components/account-action/edit-my-data.directive';
import { LogoutDirective } from './components/account-action/logout.directive';
import { UserWorkspacesAreaComponent } from './components/user-workspaces-area/user-workspaces-area.component';
import { WarningComponent } from './components/warning/warning.component';
import { AreaTitleComponent } from './components/area-title/area-title.component';
import { AppInfoComponent } from './components/app-info/app-info.component';
import { UserReviewsAreaComponent } from './components/user-reviews-area/user-reviews-area.component';
import { UserIssuesComponent } from './components/user-issues/user-issues.component';
import { UserIssuesPipe } from './components/user-issues/issues-pipe.pipe';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ChangePasswordComponent,
    RequestMessageDialogComponent,
    InputTextComponent,
    EditMyDataComponent,
    EditWorkspaceSettingsComponent,
    UserWorkspacesGroupsComponent,
    LoginComponent,
    UserMenuComponent,
    AccountActionComponent,
    ChangePasswordDirective,
    EditMyDataDirective,
    LogoutDirective,
    UserWorkspacesAreaComponent,
    WarningComponent,
    AreaTitleComponent,
    AppInfoComponent,
    UserReviewsAreaComponent,
    UserIssuesComponent,
    UserIssuesPipe
  ],
  imports: [
    ApplicationModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FlexLayoutModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    IqbComponentsModule.forRoot(),
    TranslateModule.forRoot({
      defaultLanguage: 'de',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    MatCheckboxModule,
    MatSelectModule,
    FormsModule,
    StudioComponentsModule
  ],
  providers: [
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
