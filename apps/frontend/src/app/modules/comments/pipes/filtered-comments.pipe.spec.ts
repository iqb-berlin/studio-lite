import { FilteredCommentsPipe } from './filtered-comments.pipe';
import { Comment } from '../models/comment.interface';

describe('FilteredCommentsPipe', () => {
  let pipe: FilteredCommentsPipe;

  beforeEach(() => {
    pipe = new FilteredCommentsPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return all comments if itemFilters is empty', () => {
    const comments = [{ id: 1 }, { id: 2 }] as unknown as Comment[];
    expect(pipe.transform(comments, [])).toEqual(comments);
  });

  it('should filter comments by itemUuid', () => {
    const comments = [
      { id: 1, itemUuids: ['uuid1'] },
      { id: 2, itemUuids: ['uuid2'] },
      { id: 3, itemUuids: ['uuid1', 'uuid3'] }
    ] as unknown as Comment[];
    const filters = ['uuid1'];
    expect(pipe.transform(comments, filters)).toEqual([
      comments[0],
      comments[2]
    ]);
  });

  it('should filter comments with no items when "no-items" filter is provided', () => {
    const comments = [
      { id: 1, itemUuids: ['uuid1'] },
      { id: 2, itemUuids: [] }
    ] as unknown as Comment[];
    const filters = ['no-items'];
    expect(pipe.transform(comments, filters)).toEqual([comments[1]]);
  });

  it('should handle mixed filters', () => {
    const comments = [
      { id: 1, itemUuids: ['uuid1'] },
      { id: 2, itemUuids: ['uuid2'] },
      { id: 3, itemUuids: [] }
    ] as unknown as Comment[];
    const filters = ['uuid1', 'no-items'];
    expect(pipe.transform(comments, filters)).toEqual([
      comments[0],
      comments[2]
    ]);
  });
});
