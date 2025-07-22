import { NotFoundException } from '@nestjs/common';

export class UnitCommentNotFoundException extends NotFoundException {
  constructor(commentId: number, method: string) {
    const description = `UnitComment with id ${commentId} not found`;
    const objectOrError = {
      id: commentId,
      controller: 'unit-comment',
      method,
      description
    };
    super(objectOrError);
  }
}
