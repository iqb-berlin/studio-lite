import {
  CanActivate, ExecutionContext, Injectable
} from '@nestjs/common';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { UnitRichNoteNotFoundException } from '../exceptions/unit-rich-note-not-found.exception';
import { unitIdOf } from '../utils/unit-ids';

/**
 * A rich note is only found under the unit it was written on: the route
 * `units/:unit_id/rich-notes/:id` names both, and this guard holds the route to it (#1778). A note
 * asked for under another unit is answered as not being there, a 404.
 *
 * It is the third step of the path: {@link UnitInWorkspaceGuard} has held the unit to the workspace
 * before. Without it, write access to any workspace was enough to change or delete any note in the
 * system.
 *
 * A note id is spelled like a unit id (see {@link unitIdOf}); anything else is not looked up but
 * refused the same way.
 */
@Injectable()
export class RichNoteInUnitGuard implements CanActivate {
  constructor(private unitRichNoteService: UnitRichNoteService) {}

  /** Passes when the note in the route belongs to the unit in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const noteId = unitIdOf(req.params.id ?? req.params.note_id);
    const unitId = unitIdOf(req.params.unit_id);
    if (!noteId || !unitId || !await this.unitRichNoteService.isInUnit(noteId, unitId)) {
      throw new UnitRichNoteNotFoundException(noteId, req.method);
    }
    return true;
  }
}
