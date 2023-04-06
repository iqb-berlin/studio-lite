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
import { MatExpansionModule } from '@angular/material/expansion';
import { CommentsModule } from '../comments/comments.module';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';
import { NewUnitComponent } from './components/new-unit/new-unit.component';
import { SelectUnitComponent } from './components/select-unit/select-unit.component';
import { MoveUnitComponent } from './components/move-unit/move-unit.component';
import { UnitMetadataComponent } from './components/unit-metadata/unit-metadata.component';
import { UnitEditorComponent } from './components/unit-editor/unit-editor.component';
import { SaveOrDiscardComponent } from './components/save-or-discard.component';
import { UnitRoutingCanDeactivateGuard } from './guards/unit-routing.guard';
import { UnitPreviewComponent } from './components/unit-preview/unit-preview.component';
import { ExportUnitComponent } from './components/export-unit/export-unit.component';
import { UnitSchemerComponent } from './components/unit-schemer/unit-schemer.component';
import { SelectUnitListComponent } from './components/select-unit-list/select-unit-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { WorkspaceUserListComponent } from './components/workspace-user-list/workspace-user-list.component';
import {
  PagingModeSelectionComponent
} from './components/paging-mode-selection/paging-mode-selection.component';
import { UnitCommentsComponent } from './components/unit-comments/unit-comments.component';
import { HasNewCommentsPipe } from './pipes/has-new-comments.pipe';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { GroupManageComponent } from './components/group-manage/group-manage.component';
import { ReviewConfigEditComponent } from './components/review-config-edit/review-config-edit.component';
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
import { SearchUnitComponent } from './components/search-unit/search-unit.component';
import { UpdateUnitsButtonComponent } from './components/update-units-button/update-units-button.component';
import { TestConfigComponent } from './components/test-config/test-config.component';
import { PrintReviewButtonComponent } from './components/print-review-button/print-review-button.component';
import { DeleteReviewButtonComponent } from './components/delete-review-button/delete-review-button.component';
import { AddReviewButtonComponent } from './components/add-review-button/add-review-button.component';
import { StartReviewButtonComponent } from './components/start-review-button/start-review-button.component';
import { CopyReviewLinkButtonComponent } from './components/copy-review-link-button/copy-review-link-button.component';
import { ReviewMenuComponent } from './components/review-menu/review-menu.component';
import { ReviewSaveChangesComponent } from './components/review-save-changes/review-save-changes.component';
import { ReviewConfigComponent } from './components/review-config/review-config.component';
import { BookletConfigEditComponent } from './components/booklet-config-edit/booklet-config-edit.component';
import { ExportReviewButtonComponent } from './components/export-review-button/export-review-button.component';
import { NewGroupButtonComponent } from './components/new-group-button/new-group-button.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    FlexLayoutModule,
    StudioComponentsModule,
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
    MatProgressBarModule,
    TranslateModule,
    CommentsModule,
    MatBadgeModule,
    SplitterModule
  ],
  declarations: [
    TestConfigComponent,
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
    BookletConfigEditComponent,
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
    HasNewCommentsPipe,
    PrintReviewButtonComponent,
    DeleteReviewButtonComponent,
    AddReviewButtonComponent,
    StartReviewButtonComponent,
    CopyReviewLinkButtonComponent,
    ReviewMenuComponent,
    ReviewSaveChangesComponent,
    ReviewConfigComponent,
    ExportReviewButtonComponent,
    NewGroupButtonComponent
  ],
  exports: [WorkspaceComponent, UnitCommentsComponent],
  providers: [
    UnitRoutingCanDeactivateGuard,
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class WorkspaceModule {}
