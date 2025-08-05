import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceGroupsComponent } from './components/workspace-groups/workspace-groups.component';
import { UsersComponent } from './components/users/users.component';
import { AdminComponent } from './components/admin/admin.component';
import { VeronaModulesComponent } from './components/verona-modules/verona-modules.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ResourcePackagesComponent } from './components/resource-packages/resource-packages.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'workspace-groups', component: WorkspaceGroupsComponent },
      { path: 'v-modules', component: VeronaModulesComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'packages', component: ResourcePackagesComponent },
      { path: '**', component: UsersComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
