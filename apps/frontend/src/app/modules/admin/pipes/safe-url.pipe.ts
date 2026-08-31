import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Marks a URL as trusted so Angular will use it in a link or an image. Only for URLs the studio
 * produced itself -- an uploaded logo as a data URL, for instance.
 */
@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
