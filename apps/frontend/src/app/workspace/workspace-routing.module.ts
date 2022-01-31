import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkspaceComponent } from './workspace.component';
import { UnitComponent } from './unit/unit.component';
import { UnitRoutingCanDeactivateGuard } from './unit/unit-routing.guard';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceComponent,
    children: [
      {
        path: 'u/:u',
        component: UnitComponent,
        canDeactivate: [UnitRoutingCanDeactivateGuard]
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
