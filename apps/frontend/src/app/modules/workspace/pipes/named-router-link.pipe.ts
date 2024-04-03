import { Pipe, PipeTransform } from '@angular/core';

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
