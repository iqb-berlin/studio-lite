import { UnprocessableEntityException } from '@nestjs/common';

/**
 * A review was posted or patched without a name. Raised with id 0 when the review does not exist
 * yet, because there is nothing else to name it by.
 */
export class ReviewUnprocessableException extends UnprocessableEntityException {
  constructor(reviewId: number, method: string) {
    const description = `Saving of review id ${reviewId} is forbidden`;
    const objectOrError = {
      id: reviewId, controller: 'workspace/review', method, description
    };
    super(objectOrError);
  }
}
