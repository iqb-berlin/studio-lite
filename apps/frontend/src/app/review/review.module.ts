import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { StudioComponentsModule } from '@studio-lite/studio-components';
import { UnitsComponent } from './units/units.component';
import { FinishComponent } from './finish/finish.component';
import { StartComponent } from './start/start.component';
import { ReviewRoutingModule } from './review-routing.module';
import { ReviewComponent } from './review.component';

@NgModule({
  declarations: [
    ReviewComponent,
    StartComponent,
    FinishComponent,
    UnitsComponent
  ],
  imports: [
    CommonModule,
    ReviewRoutingModule,
    FlexModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    MatIconModule,
    StudioComponentsModule,
    MatSidenavModule
  ],
  exports: [ReviewComponent]
})
export class ReviewModule {}
