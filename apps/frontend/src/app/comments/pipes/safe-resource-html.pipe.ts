import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeResourceHTML'
})
export class SafeResourceHTMLPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(resourceUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustHtml(resourceUrl);
  }
}
