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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { IqbComponentsModule } from '@studio-lite-lib/iqb-components';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommentsModule } from '../comments/comments.module';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { NewUnitComponent } from './components/new-unit/new-unit.component';
import { SelectUnitComponent } from './components/select-unit/select-unit.component';
import { MoveUnitComponent } from './components/move-unit/move-unit.component';
import { UnitEditorComponent } from './components/unit-editor/unit-editor.component';
import { SaveOrDiscardComponent } from './components/save-or-discard/save-or-discard.component';
import { UnitRoutingCanDeactivateGuard } from './guards/unit-routing.guard';
import { UnitPreviewComponent } from './components/unit-preview/unit-preview.component';
import { ExportUnitComponent } from './components/export-unit/export-unit.component';
import { UnitSchemerComponent } from './components/unit-schemer/unit-schemer.component';
import { SelectUnitListComponent } from './components/select-unit-list/select-unit-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { WorkspaceUserListComponent } from './components/workspace-user-list/workspace-user-list.component';
import { PagingModeSelectionComponent } from './components/paging-mode-selection/paging-mode-selection.component';
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
import { UnitTableComponent } from './components/unit-table/unit-table.component';
import { UnitGroupComponent } from './components/unit-group/unit-group.component';
import { UpdateUnitsButtonComponent } from './components/update-units-button/update-units-button.component';
import { TestConfigComponent } from './components/test-config/test-config.component';
import { PrintReviewButtonComponent } from './components/print-review-button/print-review-button.component';
import { DeleteReviewButtonComponent } from './components/delete-review-button/delete-review-button.component';
import { AddReviewButtonComponent } from './components/add-review-button/add-review-button.component';
import { StartReviewButtonComponent } from './components/start-review-button/start-review-button.component';
import { CopyReviewLinkButtonComponent } from './components/copy-review-link-button/copy-review-link-button.component';
import { ReviewMenuComponent } from './components/review-menu/review-menu.component';
import { SaveChangesComponent } from './components/save-changes/save-changes.component';
import { ReviewConfigComponent } from './components/review-config/review-config.component';
import { BookletConfigEditComponent } from './components/booklet-config-edit/booklet-config-edit.component';
import { ExportReviewButtonComponent } from './components/export-review-button/export-review-button.component';
import { NewGroupButtonComponent } from './components/new-group-button/new-group-button.component';
import { GroupMenuComponent } from './components/group-menu/group-menu.component';
import { PreviewBarComponent } from './components/preview-bar/preview-bar.component';
import { StatusIndicationComponent } from './components/status-indication/status-indication.component';

import { UnitGroupsComponent } from './components/unit-groups/unit-groups.component';
import { NamedRouterLinkPipe } from './pipes/named-router-link.pipe';
import { UnitPropertiesComponent } from './components/unit-properties/unit-properties.component';
import { MetadataModule } from '../metadata/metadata.module';
import { GetStateColorPipe } from './pipes/get-state-color.pipe';
import { ShowMetadataComponent } from './components/show-metadata/show-metadata.component';
import { PrintUnitsDialogComponent } from './components/print-units-dialog/print-units-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MetadataModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
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
    TestConfigComponent,
    WorkspaceComponent,
    NewUnitComponent,
    SelectUnitComponent,
    MoveUnitComponent,
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
    UpdateUnitsButtonComponent,
    HasNewCommentsPipe,
    NamedRouterLinkPipe,
    GetStateColorPipe,
    PrintReviewButtonComponent,
    DeleteReviewButtonComponent,
    AddReviewButtonComponent,
    StartReviewButtonComponent,
    CopyReviewLinkButtonComponent,
    ReviewMenuComponent,
    SaveChangesComponent,
    ReviewConfigComponent,
    ExportReviewButtonComponent,
    NewGroupButtonComponent,
    GroupMenuComponent,
    PreviewBarComponent,
    StatusIndicationComponent,
    UnitGroupsComponent,
    UnitPropertiesComponent,
    ShowMetadataComponent,
    PrintUnitsDialogComponent
  ],
  exports: [
    WorkspaceComponent,
    UnitCommentsComponent,
    UnitGroupComponent,
    UnitTableComponent,
    SelectUnitListComponent
  ],
  providers: [
    UnitRoutingCanDeactivateGuard,
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class WorkspaceModule {}
