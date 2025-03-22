import { NotFoundException } from '@nestjs/common';

export class UnitNotFoundException extends NotFoundException {
  constructor(unitId: number, workspaceId: number, method: string) {
    const description = `Unit with id ${unitId} not found in workspace with id ${workspaceId}`;
    const objectOrError = {
      id: unitId, controller: 'workspace-unit', method, description
    };
    super(objectOrError);
  }
}
