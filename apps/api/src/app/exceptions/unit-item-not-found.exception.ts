import { NotFoundException } from '@nestjs/common';

/** No unit item with this uuid; see {@link ItemUuid} for what that uuid is. */
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
