import { NotFoundException } from '@nestjs/common';

export class UnitItemNotFoundException extends NotFoundException {
  constructor(itemUuid: string, method: string) {
    const description = `Unit item with uuid ${itemUuid} not found`;
    const objectOrError = {
      uuid: itemUuid,
      controller: 'item-comment',
      method,
      description
    };
    super(objectOrError);
  }
}
