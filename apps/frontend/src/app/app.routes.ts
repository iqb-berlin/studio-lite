import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'home/:login', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'print',
    loadChildren: () => import('./modules/print/print.routes').then(m => m.PRINT_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'a/:ws',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/workspace/workspace.routes').then(m => m.WORKSPACE_ROUTES)
  },
  {
    path: 'wsg-admin/:wsg',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/wsg-admin/wsg-admin.routes').then(m => m.WSG_ADMIN_ROUTES)
  },
  {
    path: 'review/:review',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/review/review.routes').then(m => m.REVIEW_ROUTES)
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: ':login', redirectTo: 'home/:login', pathMatch: 'full' }
];
