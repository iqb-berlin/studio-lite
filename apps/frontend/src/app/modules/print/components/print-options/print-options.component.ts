import { Component } from '@angular/core';
import { PrintOptions } from '../../models/print-options.interface';

@Component({
  selector: 'studio-lite-print-options',
  templateUrl: './print-options.component.html',
  styleUrls: ['./print-options.component.scss']
})
export class PrintOptionsComponent {
  options: PrintOptions[] = [
    { key: 'printProperties', value: true },
    { key: 'printComments', value: true },
    { key: 'printCoding', value: true },
    { key: 'printPreview', value: true }
  ];
}
