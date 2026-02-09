import { UnitCommentNotFoundException } from './unit-comment-not-found.exception';

describe('UnitCommentNotFoundException', () => {
  it('should be defined', () => {
    const exception = new UnitCommentNotFoundException(1, 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'unit-comment',
      method: 'GET',
      description: 'UnitComment with id 1 not found'
    });
  });
});
