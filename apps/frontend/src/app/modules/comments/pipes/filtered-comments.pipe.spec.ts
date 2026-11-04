import { createMock } from '@golevelup/ts-jest';
import { FilteredCommentsPipe } from './filtered-comments.pipe';
import { Comment } from '../models/comment.interface';

describe('FilteredCommentsPipe', () => {
  let pipe: FilteredCommentsPipe;

  beforeEach(() => {
    pipe = new FilteredCommentsPipe();
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

  describe('vote filters', () => {
    const comment = (id: number, upVotes?: number, downVotes?: number, itemUuids: string[] = []): Comment => (
      createMock<Comment>({
        id, upVotes, downVotes, itemUuids
      }));
    const comments = [comment(1, 2, 0), comment(2, 0, 1), comment(3, 1, 1), comment(4)];

    it.each<[string[], number[]]>([
      [['up'], [1, 3]],
      [['down'], [2, 3]],
      [['controversial'], [3]],
      [['up', 'down'], [1, 2, 3]]
    ])('should keep the comments that the vote filter %j asks for', (voteFilters, ids) => {
      expect(pipe.transform(comments, [], voteFilters).map(c => c.id)).toEqual(ids);
    });

    it('should keep only the comments that pass both the item and the vote filter', () => {
      const withItems = [comment(1, 1, 0, ['uuid1']), comment(2, 1, 0, ['uuid2']), comment(3, 0, 0, ['uuid1'])];

      expect(pipe.transform(withItems, ['uuid1'], ['up']).map(c => c.id)).toEqual([1]);
    });
  });
});
