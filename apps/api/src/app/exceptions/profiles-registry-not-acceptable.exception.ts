import { NotAcceptableException } from '@nestjs/common';

/**
 * The registry of metadata profiles could not be read -- the configured CSV came back empty. Kept
 * apart from a 404: the registry is configured, it just did not deliver.
 */
export class ProfilesRegistryNotAcceptableException extends NotAcceptableException {
  constructor(key: string, method: string) {
    const description = `Profiles registry with key ${key} not acceptable`;
    const objectOrError = {
      id: key, controller: 'metadata', method, description
    };
    super(objectOrError);
  }
}
