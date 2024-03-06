import {
  Component, EventEmitter, OnInit, Output
} from '@angular/core';
import { PrintOptions } from '../../../print/models/print-options.interface';

@Component({
  selector: 'studio-lite-print-options',
  templateUrl: './print-options.component.html',
  styleUrls: ['./print-options.component.scss']
})
export class PrintOptionsComponent implements OnInit {
  printOptions: PrintOptions[] = [
    { key: 'printProperties', value: true },
    { key: 'printMetadata', value: true },
    { key: 'printComments', value: true },
    { key: 'printCoding', value: true },
    { key: 'printPreview', value: true }
  ];

  @Output() printOptionsChange: EventEmitter<PrintOptions[]> = new EventEmitter<PrintOptions[]>();

  ngOnInit(): void {
    this.printOptionsChange.emit(this.printOptions);
  }
}
