import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bytes' })
export class BytesPipe implements PipeTransform {
  private units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  public transform(bytes: number): string {
    if (isNaN(parseFloat(`${bytes}`)) || !isFinite(bytes)) {
      return '-';
    }
    if (bytes <= 0) {
      return '0';
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, Math.floor(i))).toFixed(1)} ${this.units[i]}`;
  }
}
