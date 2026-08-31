import { Pipe, PipeTransform } from '@angular/core';

/**
 * Builds the router link for a named outlet. Written as a pipe because the literal it produces is
 * an object, and object literals in a template are new on every change-detection cycle.
 */
@Pipe({
  name: 'namedRouterLink',
  standalone: true
})
export class NamedRouterLinkPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(outletName: string, path: string): { outlets: { [outletName: string]: string[] } }[] {
    return [{ outlets: { [outletName]: [path] } }];
  }
}
