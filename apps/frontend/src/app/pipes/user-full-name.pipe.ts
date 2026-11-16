import { Pipe, PipeTransform } from '@angular/core';
import { UserFullDto } from '@studio-lite-lib/api-dto';

type NamedUser = Pick<UserFullDto, 'name' | 'lastName' | 'firstName'>;

/**
 * A user's name as the user tables show it: last name and first name, or the login name where no
 * last name is entered -- built as the API builds the `displayName` of the other user lists, blanks
 * around a name left out. The tables sort their name column by this text as well (#2145).
 *
 * It takes the three texts and not the user: the admin table updates its rows in place, and a pure
 * pipe handed the same object again would keep showing the old name.
 */
@Pipe({
  name: 'userFullName',
  standalone: true
})
export class UserFullNamePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(name: string, lastName?: string, firstName?: string): string {
    return UserFullNamePipe.fullName({ name, lastName, firstName });
  }

  static fullName(user: NamedUser): string {
    const firstName = user.firstName?.trim();
    return `${user.lastName?.trim() || user.name?.trim() || ''}${firstName ? `, ${firstName}` : ''}`;
  }
}
