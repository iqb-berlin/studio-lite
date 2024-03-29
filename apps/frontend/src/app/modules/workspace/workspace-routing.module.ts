import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// eslint-disable-next-line import/no-cycle
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { UnitRoutingCanDeactivateGuard } from './guards/unit-routing.guard';
import { UnitEditorComponent } from './components/unit-editor/unit-editor.component';
import { UnitPreviewComponent } from './components/unit-preview/unit-preview.component';
import { UnitSchemerComponent } from './components/unit-schemer/unit-schemer.component';
import { UnitCommentsComponent } from './components/unit-comments/unit-comments.component';
import { UnitPropertiesComponent } from './components/unit-properties/unit-properties.component';

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
      { path: 'editor', component: UnitEditorComponent },
      { path: 'preview', component: UnitPreviewComponent },
      { path: 'schemer', component: UnitSchemerComponent },
      { path: 'comments', component: UnitCommentsComponent },
      { path: '**', component: UnitPropertiesComponent },
      { path: 'editor', component: UnitEditorComponent, outlet: 'secondary' },
      { path: 'preview', component: UnitPreviewComponent, outlet: 'secondary' },
      { path: 'schemer', component: UnitSchemerComponent, outlet: 'secondary' },
      { path: 'comments', component: UnitCommentsComponent, outlet: 'secondary' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
