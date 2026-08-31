import { Pipe, PipeTransform } from '@angular/core';

/**
 * A file size in the largest unit that leaves a readable number, to one decimal. Nothing sensible
 * to show becomes a dash, and zero stays a plain zero rather than "0.0 B".
 */
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
