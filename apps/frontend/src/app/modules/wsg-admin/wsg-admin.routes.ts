import { Routes } from '@angular/router';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';
import { UsersComponent } from './components/users/users.component';
import { WsgAdminComponent } from './components/wsg-admin/wsg-admin.component';
import { WorkspaceSettingsComponent } from './components/settings/settings.component';
import { UnitsComponent } from './components/units/units.component';
import { UnitItemsComponent } from './components/unit-items/unit-items.component';

export const WSG_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: WsgAdminComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'workspaces', component: WorkspacesComponent },
      { path: 'units', component: UnitsComponent },
      { path: 'unit-items', component: UnitItemsComponent },
      { path: 'settings', component: WorkspaceSettingsComponent },
      { path: '**', component: UsersComponent }
    ]
  }
];
