import { NotFoundException } from '@nestjs/common';

export class UnitCommentNotFoundException extends NotFoundException {
  constructor(commentId: number, method: string) {
    const description = `UnitComment with id ${commentId} not found`;
    const objectOrError = {
      id: commentId, controller: 'workspace/:workspace_id', method, description
    };
    super(objectOrError);
  }
}
