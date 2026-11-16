import { UserInListDto } from '@studio-lite-lib/api-dto';
import { userLabel } from '../../../models/check-collection.class';

export class WorkspaceUserChecked {
  id: number;
  name: string;
  label: string;
  description: string | undefined;
  accessLevel: number;
  isChecked: boolean;
  constructor(userDto: UserInListDto) {
    this.id = userDto.id;
    this.name = userDto.name;
    this.label = userLabel(userDto);
    this.description = userDto.description;
    this.accessLevel = 0;
    this.isChecked = false;
  }
}
