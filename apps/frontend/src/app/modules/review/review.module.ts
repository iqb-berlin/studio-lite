import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { UnitsComponent } from './components/units/units.component';
import { FinishComponent } from './components/finish/finish.component';
import { StartComponent } from './components/start/start.component';
import { ReviewRoutingModule } from './review-routing.module';
import { ReviewComponent } from './components/review/review.component';
import { UnitInfoComponent } from './units/unit-info/unit-info.component';
import { CommentDialogComponent } from './comment-dialog.component';
import { CommentsModule } from '../comments/comments.module';
import { UnitInfoCodingComponent } from './units/unit-info/unit-info-coding.component';
import { UnitInfoCommentsComponent } from './units/unit-info/unit-info-comments.component';
import { UnitInfoLoaderComponent } from './units/unit-info/unit-info-loader.component';
import { BookletConfigShowComponent } from './components/booklet-config-show/booklet-config-show.component';
import { UnitNavComponent } from './components/unit-nav/unit-nav.component';
import { AddCommentButtonComponent } from './components/add-comment-button/add-comment-button.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ReviewComponent,
    StartComponent,
    FinishComponent,
    UnitsComponent,
    UnitInfoComponent,
    UnitInfoCodingComponent,
    UnitInfoCommentsComponent,
    UnitInfoLoaderComponent,
    CommentDialogComponent,
    BookletConfigShowComponent,
    UnitNavComponent,
    AddCommentButtonComponent
  ],
  imports: [
    CommonModule,
    ReviewRoutingModule,
    SharedModule,
    CommentsModule,
    FlexModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    MatIconModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDialogModule,
    TranslateModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'de-DE' }],
  exports: [ReviewComponent]
})
export class ReviewModule {}
