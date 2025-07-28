import { NotAcceptableException } from '@nestjs/common';

export class ProfilesRegistryNotAcceptableException extends NotAcceptableException {
  constructor(key: string, method: string) {
    const description = `Profiles registry with key ${key} not acceptable`;
    const objectOrError = {
      id: key, controller: 'metadata', method, description
    };
    super(objectOrError);
  }
}
