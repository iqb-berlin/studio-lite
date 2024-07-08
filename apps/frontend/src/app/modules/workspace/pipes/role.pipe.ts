import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(accessLevel: number): string {
    return ['guest', 'commentator', 'developer', 'maintainer', 'super'][accessLevel];
  }
}
