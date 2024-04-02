import {
  Component, EventEmitter, OnInit, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';

import { IsActivePrintOption } from '../../pipes/isActivePrintOption.pipe';
import { PrintOptions } from '../../../print/models/print-options.interface';

@Component({
  selector: 'studio-lite-print-options',
  templateUrl: './print-options.component.html',
  styleUrls: ['./print-options.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatCheckbox, FormsModule, MatFormField, MatLabel, MatInput, TranslateModule, IsActivePrintOption]
})
export class PrintOptionsComponent implements OnInit {
  printOptions: PrintOptions[] = [
    { key: 'printProperties', value: true },
    { key: 'printMetadata', value: true },
    { key: 'printComments', value: true },
    { key: 'printCoding', value: true },
    { key: 'printPreview', value: true },
    { key: 'printPreviewHeight', value: 1000 }
  ];

  @Output() printOptionsChange: EventEmitter<PrintOptions[]> = new EventEmitter<PrintOptions[]>();

  ngOnInit(): void {
    this.printOptionsChange.emit(this.printOptions);
  }

  setPrintOptions(printOptions: PrintOptions[]): void {
    this.printOptions = printOptions.map(_ => _);
    this.printOptionsChange.emit(this.printOptions);
  }
}
