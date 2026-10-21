import { ConflictException } from '@nestjs/common';

/**
 * Another unit of the workspace already carries this key. Keys are compared as the form compares
 * them -- ignoring case and surrounding blanks -- since two units told apart only by case would
 * still collide wherever the key names a file or a booklet entry.
 */
export class UnitKeyExistsException extends ConflictException {
  constructor(unitId: number, workspaceId: number, key: string) {
    const description = `Unit key ${key} is already used in workspace with id ${workspaceId}`;
    const objectOrError = {
      id: unitId, controller: 'workspace-unit', method: 'PATCH', description
    };
    super(objectOrError);
  }
}
