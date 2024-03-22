import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'bytes',
    standalone: true
})
export class BytesPipe implements PipeTransform {
  private units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  transform(bytes: number): string {
    if (Number.isNaN(parseFloat(`${bytes}`)) || !Number.isFinite(bytes)) {
      return '-';
    }
    if (bytes <= 0) {
      return '0';
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / (1024 ** Math.floor(i))).toFixed(1)} ${this.units[i]}`;
  }
}
