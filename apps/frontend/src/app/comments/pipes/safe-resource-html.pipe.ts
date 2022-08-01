import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeResourceHTML'
})
export class SafeResourceHTMLPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(resourceHTML: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(resourceHTML);
  }
}
