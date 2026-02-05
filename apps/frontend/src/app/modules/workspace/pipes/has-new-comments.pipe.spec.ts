import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { HasNewCommentsPipe } from './has-new-comments.pipe';

describe('HasNewCommentsPipe', () => {
  let pipe: HasNewCommentsPipe;

  beforeEach(() => {
    pipe = new HasNewCommentsPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true when lastCommentChangedAt is after lastSeenCommentChangedAt', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      lastCommentChangedAt: new Date('2026-02-04T12:00:00'),
      lastSeenCommentChangedAt: new Date('2026-02-04T10:00:00')
    };

    expect(pipe.transform(unit)).toBe(true);
  });

  it('should return false when lastCommentChangedAt is before lastSeenCommentChangedAt', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      lastCommentChangedAt: new Date('2026-02-04T10:00:00'),
      lastSeenCommentChangedAt: new Date('2026-02-04T12:00:00')
    };

    expect(pipe.transform(unit)).toBe(false);
  });

  it('should return false when lastCommentChangedAt equals lastSeenCommentChangedAt', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      lastCommentChangedAt: new Date('2026-02-04T12:00:00'),
      lastSeenCommentChangedAt: new Date('2026-02-04T12:00:00')
    };

    expect(pipe.transform(unit)).toBe(false);
  });

  it('should return false when lastCommentChangedAt is undefined', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      lastCommentChangedAt: undefined,
      lastSeenCommentChangedAt: new Date('2026-02-04T12:00:00')
    };

    expect(pipe.transform(unit)).toBe(false);
  });

  it('should return false when lastSeenCommentChangedAt is undefined', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      lastCommentChangedAt: new Date('2026-02-04T12:00:00'),
      lastSeenCommentChangedAt: undefined
    };

    expect(pipe.transform(unit)).toBe(false);
  });

  it('should return false when both timestamps are undefined', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1',
      lastCommentChangedAt: undefined,
      lastSeenCommentChangedAt: undefined
    };

    expect(pipe.transform(unit)).toBe(false);
  });

  it('should handle minimal unit object', () => {
    const unit: UnitInListDto = {
      id: 1,
      key: 'unit1'
    };

    expect(pipe.transform(unit)).toBe(false);
  });
});
