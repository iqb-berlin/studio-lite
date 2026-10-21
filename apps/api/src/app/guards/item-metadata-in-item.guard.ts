import {
  CanActivate, ExecutionContext, Injectable
} from '@nestjs/common';
import { UnitItemMetadataService } from '../services/unit-item-metadata.service';
import { UnitItemMetadataNotFoundException } from '../exceptions/unit-item-metadata-not-found.exception';
import { unitIdOf } from '../utils/unit-ids';
import { isItemUuid } from '../utils/item-uuid';

/**
 * A metadata row is only found under the item it describes: the route
 * `items/:item_uuid/metadata/:id` names both, and this guard holds the route to it (#1778). A row
 * asked for under another item is answered as not being there, a 404.
 *
 * It is the last step of the path and runs after {@link ItemInUnitGuard}, which has held the item to
 * the unit. Without the two, write access to any workspace was enough to delete any item's metadata
 * in the system.
 *
 * A row id is spelled like a unit id (see {@link unitIdOf}); anything else is not looked up but
 * refused the same way.
 */
@Injectable()
export class ItemMetadataInItemGuard implements CanActivate {
  constructor(private unitItemMetadataService: UnitItemMetadataService) {}

  /** Passes when the metadata row in the route is one of the item in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const id = unitIdOf(req.params.id);
    const itemUuid = req.params.item_uuid;
    if (!id || !isItemUuid(itemUuid) || !await this.unitItemMetadataService.isOfItem(id, itemUuid)) {
      throw new UnitItemMetadataNotFoundException(id, req.method);
    }
    return true;
  }
}
