import { UserInListDto } from '@studio-lite-lib/api-dto';

export class WorkspaceUserChecked {
  id: number;
  name: string;
  displayName: string | undefined;
  description: string | undefined;
  writeAccessLevel: number;
  isChecked: boolean;
  constructor(userDto: UserInListDto) {
    this.id = userDto.id;
    this.name = userDto.name;
    this.displayName = userDto.displayName;
    this.description = userDto.description;
    this.writeAccessLevel = 0;
    this.isChecked = false;
  }
}
