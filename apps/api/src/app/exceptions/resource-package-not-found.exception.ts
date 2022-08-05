import { NotFoundException } from '@nestjs/common';

export class ResourcePackageNotFoundException extends NotFoundException {
  constructor(id: number, method: string) {
    const description = `ResourcePackage with id ${id} not found`;
    const objectOrError = {
      id: id, controller: 'workspace/:workspace_id', method, description
    };
    super(objectOrError);
  }
}
