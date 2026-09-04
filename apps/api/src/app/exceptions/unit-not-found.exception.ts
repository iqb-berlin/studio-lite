import { NotFoundException } from '@nestjs/common';

/**
 * No unit with this id in this workspace. Both ids are part of the answer on purpose: a unit that
 * exists elsewhere is not found here either, and that difference is what a report from the field
 * has to show.
 */
export class UnitNotFoundException extends NotFoundException {
  constructor(unitId: number, workspaceId: number, method: string) {
    const description = `Unit with id ${unitId} not found in workspace with id ${workspaceId}`;
    const objectOrError = {
      id: unitId, controller: 'workspace-unit', method, description
    };
    super(objectOrError);
  }
}
