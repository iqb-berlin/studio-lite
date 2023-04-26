import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'home/:login', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'print',
    loadChildren: () => import('./modules/print/print.module').then(module => module.PrintModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(module => module.AdminModule)
  },
  {
    path: 'a/:ws',
    loadChildren: () => import('./modules/workspace/workspace.module').then(module => module.WorkspaceModule)
  },
  {
    path: 'wsg-admin/:wsg',
    loadChildren: () => import('./modules/wsg-admin/wsg-admin.module').then(module => module.WsgAdminModule)
  },
  {
    path: 'review/:review',
    loadChildren: () => import('./modules/review/review.module').then(module => module.ReviewModule)
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: ':login', redirectTo: 'home/:login', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        onSameUrlNavigation: 'reload'
        // relativeLinkResolution: 'legacy'
      }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
