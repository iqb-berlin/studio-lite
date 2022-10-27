import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { StudioComponentsModule } from '@studio-lite/studio-components';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { UnitsComponent } from './units/units.component';
import { FinishComponent } from './finish/finish.component';
import { StartComponent } from './start/start.component';
import { ReviewRoutingModule } from './review-routing.module';
import { ReviewComponent } from './review.component';
import { UnitInfoComponent } from './units/unit-info.component';
import { CommentDialogComponent } from './comment-dialog.component';
import { CommentsModule } from '../comments/comments.module';

@NgModule({
  declarations: [
    ReviewComponent,
    StartComponent,
    FinishComponent,
    UnitsComponent,
    UnitInfoComponent,
    CommentDialogComponent
  ],
  imports: [
    CommonModule,
    ReviewRoutingModule,
    CommentsModule,
    FlexModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    MatIconModule,
    StudioComponentsModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatDialogModule,
    TranslateModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule
  ],
  exports: [ReviewComponent]
})
export class ReviewModule {}
