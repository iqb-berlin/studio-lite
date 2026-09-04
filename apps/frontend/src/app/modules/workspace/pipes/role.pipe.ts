import { Pipe, PipeTransform } from '@angular/core';

/**
 * The name of an access level: guest, commenter, developer, maintainer, super -- the same ladder
 * the API's guards ask about, here by its position.
 */
@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(accessLevel: number): string {
    return ['guest', 'commenter', 'developer', 'maintainer', 'super'][accessLevel];
  }
}
