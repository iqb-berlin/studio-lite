import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BookletConfigEditComponent } from './booklet-config/booklet-config-edit.component';
import { SelectModuleComponent } from './modules/select-module.component';
import { VeronaModuleClass } from './modules/verona-module.class';
import { ModuleService } from './modules/module.service';
import { BookletConfigShowComponent } from './booklet-config/booklet-config-show.component';

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
    BookletConfigEditComponent,
    BookletConfigShowComponent,
    SelectModuleComponent
  ],
  exports: [
    BookletConfigEditComponent,
    BookletConfigShowComponent,
    SelectModuleComponent
  ]
})
export class StudioComponentsModule {}

export {
  VeronaModuleClass,
  ModuleService,
  SelectModuleComponent,
  BookletConfigEditComponent,
  BookletConfigShowComponent
};
