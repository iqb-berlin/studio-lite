import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { PrintComponent } from './components/print/print.component';
import { PrintRoutingModule } from './print-routing.module';
import { UnitPrintLayoutComponent } from './components/unit-print-layout/unit-print-layout.component';
import { UnitPrintHeaderComponent } from './components/unit-print-header/unit-print-header.component';
import { UnitPrintPlayerComponent } from './components/unit-print-player/unit-print-player.component';
import { UnitPrintCommentsComponent } from './components/unit-print-comments/unit-print-comments.component';
import { CommentsModule } from '../comments/comments.module';
import { UnitPrintCodingComponent } from './components/unit-print-coding/unit-print-coding.component';
import { UnitPrintCodeComponent } from './components/unit-print-code/unit-print-code.component';

@NgModule({
  declarations: [
    PrintComponent,
    UnitPrintLayoutComponent,
    UnitPrintHeaderComponent,
    UnitPrintPlayerComponent,
    UnitPrintCommentsComponent,
    UnitPrintCodingComponent,
    UnitPrintCodeComponent
  ],
  imports: [
    CommonModule,
    PrintRoutingModule,
    TranslateModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    CommentsModule
  ]
})
export class PrintModule {}
