import { UserInListDto } from '@studio-lite-lib/api-dto';

export class UserChecked {
  id: number;
  name: string;
  displayName: string | undefined;
  description: string | undefined;
  isChecked: boolean;
  constructor(userDto: UserInListDto) {
    this.id = userDto.id;
    this.name = userDto.name;
    this.displayName = userDto.displayName;
    this.description = userDto.description;
    this.isChecked = false;
  }
}
