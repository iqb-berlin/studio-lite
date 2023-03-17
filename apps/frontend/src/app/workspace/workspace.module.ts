import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';

import { IqbComponentsModule } from '@studio-lite-lib/iqb-components';
import { TranslateModule } from '@ngx-translate/core';
import { StudioComponentsModule } from '@studio-lite/studio-components';
import { MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { CommentsModule } from '../comments/comments.module';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';
import { NewUnitComponent } from './dialogs/new-unit.component';
import { SelectUnitComponent } from './dialogs/select-unit.component';
import { MoveUnitComponent } from './dialogs/move-unit.component';
import { UnitMetadataComponent } from './unit/unit-metadata/unit-metadata.component';
import { UnitEditorComponent } from './unit/unit-editor/unit-editor.component';
import { SaveOrDiscardComponent } from './dialogs/save-or-discard.component';
import { UnitRoutingCanDeactivateGuard } from './unit/unit-routing.guard';
import { UnitPreviewComponent } from './unit/unit-preview/unit-preview.component';
import { ExportUnitComponent } from './dialogs/export-unit/export-unit.component';
import { UnitSchemerComponent } from './unit/unit-schemer/unit-schemer.component';
import { SelectUnitListComponent } from './components/select-unit-list.component';
import { UserListComponent } from './components/user-list.component';
import { WorkspaceUserListComponent } from './dialogs/workspace-user-list.component';
import {
  PagingModeSelectionComponent
} from './unit/unit-preview/paging-mode-selection/paging-mode-selection.component';
import { UnitCommentsComponent } from './unit/unit-comments/unit-comments.component';
import { HasNewCommentsPipe } from './pipes/has-new-comments.pipe';
import { ReviewsComponent } from './dialogs/reviews/reviews.component';
import { GroupManageComponent } from './dialogs/group-manage.component';
import { ReviewConfigEditComponent } from './components/review-config-edit.component';
import { UnitSelectionComponent } from './components/unit-selection/unit-selection.component';
import { UnitSaveButtonComponent } from './components/unit-save-button/unit-save-button.component';
import { UnitDataAreaComponent } from './components/unit-data-area/unit-data-area.component';
import { AddUnitButtonComponent } from './components/add-unit-button/add-unit-button.component';
import { DeleteUnitButtonComponent } from './components/delete-unit-button/delete-unit-button.component';
import { EditUnitButtonComponent } from './components/edit-unit-button/edit-unit-button.component';
import { UnitsAreaComponent } from './components/units-area/units-area.component';
import { SplitterModule } from '../splitter/splitter.module';
import { UnitTableComponent } from './components/unit-table/unit-table.component';
import { UnitGroupComponent } from './components/unit-group/unit-group.component';
import { FilterUnitsPipe } from './pipes/filter-units.pipe';
import { SearchUnitComponent } from './components/search-unit/search-unit.component';
import { UpdateUnitsButtonComponent } from './components/update-units-button/update-units-button.component';
import { TestcenterDataComponent } from './components/testcenter-data/testcenter-data.component';
import { PrintReviewButtonComponent } from './components/print-review-button/print-review-button.component';
import { DeleteReviewButtonComponent } from './components/delete-review-button/delete-review-button.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    FlexLayoutModule,
    WorkspaceRoutingModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatListModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatMenuModule,
    MatSortModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatTableModule,
    MatCheckboxModule,
    MatRippleModule,
    FormsModule,
    MatTabsModule,
    IqbComponentsModule,
    StudioComponentsModule,
    MatProgressBarModule,
    TranslateModule,
    CommentsModule,
    MatBadgeModule,
    SplitterModule
  ],
  declarations: [
    TestcenterDataComponent,
    WorkspaceComponent,
    NewUnitComponent,
    SelectUnitComponent,
    MoveUnitComponent,
    UnitMetadataComponent,
    UnitEditorComponent,
    SaveOrDiscardComponent,
    UnitPreviewComponent,
    ExportUnitComponent,
    UnitSchemerComponent,
    SelectUnitListComponent,
    UserListComponent,
    WorkspaceUserListComponent,
    PagingModeSelectionComponent,
    UnitCommentsComponent,
    GroupManageComponent,
    ReviewsComponent,
    ReviewConfigEditComponent,
    UnitSelectionComponent,
    UnitSaveButtonComponent,
    UnitDataAreaComponent,
    AddUnitButtonComponent,
    DeleteUnitButtonComponent,
    EditUnitButtonComponent,
    UnitsAreaComponent,
    UnitTableComponent,
    UnitGroupComponent,
    SearchUnitComponent,
    UpdateUnitsButtonComponent,
    FilterUnitsPipe,
    HasNewCommentsPipe,
    PrintReviewButtonComponent,
    DeleteReviewButtonComponent
  ],
  exports: [WorkspaceComponent, UnitCommentsComponent],
  providers: [
    UnitRoutingCanDeactivateGuard,
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class WorkspaceModule {}
