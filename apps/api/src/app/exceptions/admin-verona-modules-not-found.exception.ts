import { NotFoundException } from '@nestjs/common';

export class AdminVeronaModulesNotFoundException extends NotFoundException {
  constructor(key: string, method: string) {
    const description = `Admin verona modules with id ${key} not found`;
    const objectOrError = {
      id: key, controller: 'admin/verona-modules', method, description
    };
    super(objectOrError);
  }
}
