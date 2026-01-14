import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReviewComponent } from './components/review/review.component';
import { StartComponent } from './components/start/start.component';
import { FinishComponent } from './components/finish/finish.component';
import { UnitPlayerComponent } from './components/unit-player/unit-player.component';

const routes: Routes = [
  {
    path: '',
    component: ReviewComponent,
    children: [
      {
        path: '',
        redirectTo: 'start',
        pathMatch: 'full'
      },
      {
        path: 'start',
        component: StartComponent
      },
      {
        path: 'u/:u',
        component: UnitPlayerComponent
      },
      {
        path: 'end',
        component: FinishComponent
      },
      {
        path: '*',
        redirectTo: 'start',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '*',
    component: ReviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewRoutingModule { }
