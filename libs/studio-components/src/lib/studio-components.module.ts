import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BookletConfigComponent } from './booklet-config/booklet-config.component';

@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    TranslateModule,
    FlexLayoutModule
  ],
  declarations: [
    BookletConfigComponent
  ],
  exports: [
    BookletConfigComponent
  ]
})
export class StudioComponentsModule {}

export {
  BookletConfigComponent
};
