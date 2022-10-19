import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BookletConfigComponent } from './booklet-config/booklet-config.component';
import { SelectModuleComponent } from './modules/select-module.component';
import { VeronaModuleClass } from './modules/verona-module.class';
import { ModuleService } from './modules/module.service';

@NgModule({
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    TranslateModule,
    FlexLayoutModule,
    ReactiveFormsModule
  ],
  declarations: [
    BookletConfigComponent,
    SelectModuleComponent
  ],
  exports: [
    BookletConfigComponent,
    SelectModuleComponent
  ]
})
export class StudioComponentsModule {}

export {
  VeronaModuleClass,
  ModuleService,
  SelectModuleComponent,
  BookletConfigComponent
};
