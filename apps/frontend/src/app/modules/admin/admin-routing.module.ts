import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceGroupsComponent } from './components/workspace-groups/workspace-groups.component';
import { UsersComponent } from './components/users/users.component';
import { AdminComponent } from './components/admin/admin.component';
import { VeronaModulesComponent } from './components/verona-modules/verona-modules.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ResourcePackagesComponent } from './components/resource-packages/resource-packages.component';
import { WorkspacesComponent } from './components/workspaces/workspaces.component';
import { UnitsComponent } from './components/units/units.component';
import { UnitItemsComponent } from './components/unit-items/unit-items.component';
import { WidgetsComponent } from './components/widgets/widgets.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'workspace-groups', component: WorkspaceGroupsComponent },
      { path: 'workspaces', component: WorkspacesComponent },
      { path: 'units', component: UnitsComponent },
      { path: 'unit-items', component: UnitItemsComponent },
      { path: 'v-modules', component: VeronaModulesComponent },
      { path: 'widgets', component: WidgetsComponent },
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
