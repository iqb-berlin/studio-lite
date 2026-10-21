import { NotFoundException } from '@nestjs/common';

/** No metadata row with this id on the item it was asked for -- one of another item is not found either. */
export class UnitItemMetadataNotFoundException extends NotFoundException {
  constructor(metadataId: number, method: string) {
    const description = `Unit item metadata with id ${metadataId} not found`;
    const objectOrError = {
      id: metadataId,
      controller: 'unit-item-metadata',
      method,
      description
    };
    super(objectOrError);
  }
}
