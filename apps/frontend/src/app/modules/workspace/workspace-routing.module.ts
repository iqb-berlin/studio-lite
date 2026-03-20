import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// eslint-disable-next-line import/no-cycle
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { UnitRoutingCanDeactivateGuard } from './guards/unit-routing.guard';
import { UnitEditorComponent } from './components/unit-editor/unit-editor.component';
import { UnitPreviewComponent } from './components/unit-preview/unit-preview.component';
import { UnitSchemerComponent } from './components/unit-schemer/unit-schemer.component';
import { UnitCommentsComponent } from './components/unit-comments/unit-comments.component';
import { UnitRichNotesComponent } from './components/unit-rich-notes/unit-rich-notes.component';
import { UnitPropertiesComponent } from './components/unit-properties/unit-properties.component';
import { HiddenRouteGuard } from './guards/hidden-route.guard';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceComponent
  },
  {
    path: ':u',
    component: WorkspaceComponent,
    canDeactivate: [UnitRoutingCanDeactivateGuard],
    children: [
      {
        path: '', redirectTo: 'properties', pathMatch: 'full'
      },
      { path: 'properties', component: UnitPropertiesComponent },
      { path: 'editor', component: UnitEditorComponent, canActivate: [HiddenRouteGuard] },
      { path: 'preview', component: UnitPreviewComponent, canActivate: [HiddenRouteGuard] },
      { path: 'schemer', component: UnitSchemerComponent, canActivate: [HiddenRouteGuard] },
      { path: 'comments', component: UnitCommentsComponent, canActivate: [HiddenRouteGuard] },
      { path: 'notes', component: UnitRichNotesComponent, canActivate: [HiddenRouteGuard] },
      { path: '**', component: UnitPropertiesComponent },
      {
        path: 'editor', component: UnitEditorComponent, outlet: 'secondary', canActivate: [HiddenRouteGuard]
      },
      {
        path: 'preview', component: UnitPreviewComponent, outlet: 'secondary', canActivate: [HiddenRouteGuard]
      },
      {
        path: 'schemer', component: UnitSchemerComponent, outlet: 'secondary', canActivate: [HiddenRouteGuard]
      },
      {
        path: 'comments', component: UnitCommentsComponent, outlet: 'secondary', canActivate: [HiddenRouteGuard]
      },
      {
        path: 'notes', component: UnitRichNotesComponent, outlet: 'secondary', canActivate: [HiddenRouteGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
