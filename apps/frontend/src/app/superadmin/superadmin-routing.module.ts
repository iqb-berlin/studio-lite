import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspacesComponent } from './workspaces/workspaces.component';
import { UsersComponent } from './users/users.component';
import { SuperadminComponent } from './superadmin.component';
import { VeronaModulesComponent } from './verona-modules/verona-modules.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: SuperadminComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'workspaces', component: WorkspacesComponent },
      { path: 'v-modules', component: VeronaModulesComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '**', component: UsersComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperadminRoutingModule { }
