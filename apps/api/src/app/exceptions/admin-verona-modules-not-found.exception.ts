import { NotFoundException } from '@nestjs/common';

/** No Verona module installed under this key, raised from the module administration. */
export class AdminVeronaModulesNotFoundException extends NotFoundException {
  constructor(key: string, method: string) {
    const description = `Admin verona modules with id ${key} not found`;
    const objectOrError = {
      id: key, controller: 'admin/verona-modules', method, description
    };
    super(objectOrError);
  }
}
