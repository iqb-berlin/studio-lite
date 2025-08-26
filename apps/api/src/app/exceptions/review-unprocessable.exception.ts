import { UnprocessableEntityException } from '@nestjs/common';

export class ReviewUnprocessableException extends UnprocessableEntityException {
  constructor(reviewId: number, method: string) {
    const description = `Saving of review id ${reviewId} is forbidden`;
    const objectOrError = {
      id: reviewId, controller: 'workspace/review', method, description
    };
    super(objectOrError);
  }
}
