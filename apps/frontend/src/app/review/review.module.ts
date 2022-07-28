import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewComponent } from './review.component';
import { ReviewRoutingModule } from './review-routing.module';

@NgModule({
  declarations: [
    ReviewComponent
  ],
  imports: [
    CommonModule,
    ReviewRoutingModule
  ],
  exports: [
    ReviewComponent
  ]
})
export class ReviewModule {}
