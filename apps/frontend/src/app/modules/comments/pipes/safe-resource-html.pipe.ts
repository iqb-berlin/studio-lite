import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeResourceHTML',
  standalone: true
})
export class SafeResourceHTMLPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(resourceHTML: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(resourceHTML);
  }
}
