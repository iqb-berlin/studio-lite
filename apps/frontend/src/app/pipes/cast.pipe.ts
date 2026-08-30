import { Pipe, PipeTransform } from '@angular/core';

/**
 * Narrows a value to a subtype for the template's benefit, and does nothing at runtime. The typed
 * alternative to `$any()`, which this project does not allow: a cast that names the target type
 * still fails to compile when that type changes.
 */
@Pipe({
  name: 'cast',
  standalone: true
})
export class CastPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  transform<S, T extends S>(value: S, type: T): T {
    return <T>value;
  }
}
