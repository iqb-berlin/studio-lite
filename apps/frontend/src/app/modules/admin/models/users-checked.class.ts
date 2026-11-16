import { UserInListDto } from '@studio-lite-lib/api-dto';
import { userLabel } from '../../../models/check-collection.class';

export class UserChecked {
  id: number;
  name: string;
  label: string;
  description: string | undefined;
  isChecked: boolean;
  constructor(userDto: UserInListDto) {
    this.id = userDto.id;
    this.name = userDto.name;
    this.label = userLabel(userDto);
    this.description = userDto.description;
    this.isChecked = false;
  }
}
