import { NotFoundException } from '@nestjs/common';

/** No comment with this id -- as a rule because someone else deleted it in the meantime. */
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
