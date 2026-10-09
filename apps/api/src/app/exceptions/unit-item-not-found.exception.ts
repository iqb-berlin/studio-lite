import { NotFoundException } from '@nestjs/common';

/**
 * No unit item with this uuid; see {@link ItemUuid} for what that uuid is. `controller` names where
 * it was asked for -- the comment links, unless the caller says otherwise.
 */
export class UnitItemNotFoundException extends NotFoundException {
  constructor(itemUuid: string, method: string, controller = 'item-comment') {
    const description = `Unit item with uuid ${itemUuid} not found`;
    const objectOrError = {
      uuid: itemUuid,
      controller,
      method,
      description
    };
    super(objectOrError);
  }
}
