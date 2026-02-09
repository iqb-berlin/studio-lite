import { ReviewUnprocessableException } from './review-unprocessable.exception';

describe('ReviewUnprocessableException', () => {
  it('should be defined', () => {
    const exception = new ReviewUnprocessableException(1, 'POST');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(422);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'workspace/review',
      method: 'POST',
      description: 'Saving of review id 1 is forbidden'
    });
  });
});
