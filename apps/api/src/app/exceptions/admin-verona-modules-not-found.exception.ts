import { NotFoundException } from '@nestjs/common';

/** No Verona module installed under this key, raised from the module administration. */
export class AdminVeronaModulesNotFoundException extends NotFoundException {
  constructor(key: string, method: string) {
    const description = `Verona module with key ${key} not found`;
    const objectOrError = {
      id: key, controller: 'verona-modules', method, description
    };
    super(objectOrError);
  }
}
