import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Marks HTML as trusted so Angular renders it instead of escaping it. Only for markup the studio
 * itself produced -- a rich note, a module's own page. Anything a user typed must not go through
 * here.
 */
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
