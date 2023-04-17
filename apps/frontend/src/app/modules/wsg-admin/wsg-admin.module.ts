import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { WsgAdminComponent } from './wsg-admin.component';
import { UsersComponent } from './components/users/users.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { AuthInterceptor } from './auth.interceptor';
import { BackendService } from './backend.service';
import { WsgAdminRoutingModule } from './wsg-admin-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    WorkspacesComponent,
    UsersComponent,
    WsgAdminComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatTooltipModule,
    MatButtonModule,
    FlexLayoutModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule,
    MatTabsModule,
    WsgAdminRoutingModule
  ],
  providers: [
    BackendService,
    [
      { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ]
  ]
})
export class WsgAdminModule { }
