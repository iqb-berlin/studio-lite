import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthoringComponent } from './authoring.component';
import { UnitComponent } from './unit/unit.component';
import { UnitRoutingCanDeactivateGuard } from './unit/unit-routing.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthoringComponent,
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
export class AuthoringRoutingModule { }
