import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkspaceComponent } from './workspace.component';
import { UnitRoutingCanDeactivateGuard } from './unit/unit-routing.guard';
import { UnitMetadataComponent } from './unit/unit-metadata/unit-metadata.component';
import { UnitEditorComponent } from './unit/unit-editor/unit-editor.component';
import { UnitPreviewComponent } from './unit/unit-preview/unit-preview.component';
import { UnitSchemerComponent } from './unit/unit-schemer/unit-schemer.component';

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
      { path: '', redirectTo: 'metadata', pathMatch: 'full' },
      { path: 'metadata', component: UnitMetadataComponent },
      { path: 'editor', component: UnitEditorComponent },
      { path: 'preview', component: UnitPreviewComponent },
      { path: 'schemer', component: UnitSchemerComponent },
      { path: '**', component: UnitMetadataComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
