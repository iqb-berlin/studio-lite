import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './home/about.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(module => module.AdminModule)
  },
  {
    path: 'a/:ws',
    loadChildren: () => import('./workspace/workspace.module').then(module => module.WorkspaceModule)
  },
  {
    path: 'wsg-admin/:wsg',
    loadChildren: () => import('./wsg-admin/wsg-admin.module').then(module => module.WsgAdminModule)
  }
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
