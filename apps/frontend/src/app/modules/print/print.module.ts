import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PrintComponent } from './components/print/print.component';
import { PrintRoutingModule } from './print-routing.module';
import { UnitPrintLayoutComponent } from './components/unit-print-layout/unit-print-layout.component';
import { UnitPrintPlayerComponent } from './components/unit-print-player/unit-print-player.component';
import { UnitPrintCommentsComponent } from './components/unit-print-comments/unit-print-comments.component';
import { CommentsModule } from '../comments/comments.module';
import { UnitPrintCodingComponent } from './components/unit-print-coding/unit-print-coding.component';
import { UnitPrintCodeComponent } from './components/unit-print-code/unit-print-code.component';

import { PrintMetadataComponent } from './components/print-metadata/print-metadata.component';
import { PrintOptionsDialogComponent } from './components/print-options-dialog/print-options-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    PrintRoutingModule,
    TranslateModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTableModule,
    MatIconModule,
    CommentsModule,
    PrintComponent,
    UnitPrintLayoutComponent,
    UnitPrintPlayerComponent,
    UnitPrintCommentsComponent,
    UnitPrintCodingComponent,
    UnitPrintCodeComponent,
    PrintMetadataComponent,
    PrintOptionsDialogComponent
  ]
})
export class PrintModule {}
