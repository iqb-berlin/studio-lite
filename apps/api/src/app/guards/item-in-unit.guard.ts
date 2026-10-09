import {
  CanActivate, ExecutionContext, Injectable
} from '@nestjs/common';
import { UnitItemService } from '../services/unit-item.service';
import { UnitItemNotFoundException } from '../exceptions/unit-item-not-found.exception';
import { unitIdOf } from '../utils/unit-ids';
import { isItemUuid } from '../utils/item-uuid';

/**
 * An item is only found under the unit it is in: the routes `units/:unit_id/items/:uuid` and
 * `units/:unit_id/items/:item_uuid/metadata` name both, and this guard holds the route to it
 * (#1778). An item asked for under another unit is answered as not being there, a 404.
 *
 * It is the third step of the path: {@link UnitInWorkspaceGuard} has held the unit to the workspace
 * before. Without it, write access to any workspace was enough to delete any item in the system,
 * and to read and write its metadata.
 *
 * A uuid that is not spelled as one is not looked up but refused the same way.
 */
@Injectable()
export class ItemInUnitGuard implements CanActivate {
  constructor(private unitItemService: UnitItemService) {}

  /** Passes when the item in the route is one of the unit in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const uuid = req.params.uuid ?? req.params.item_uuid;
    const unitId = unitIdOf(req.params.unit_id);
    if (!isItemUuid(uuid) || !unitId || !await this.unitItemService.isInUnit(uuid, unitId)) {
      throw new UnitItemNotFoundException(String(uuid), req.method, 'unit-item');
    }
    return true;
  }
}
