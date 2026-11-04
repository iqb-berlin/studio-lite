import { IsNewReviewPipe } from './is-new-review.pipe';

describe('IsNewReviewPipe', () => {
  let pipe: IsNewReviewPipe;

  beforeEach(() => {
    pipe = new IsNewReviewPipe();
  });

  it('should return true for a date from exactly 3 days ago', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(pipe.transform(threeDaysAgo)).toBe(true);
  });

  // Three calendar days before 26.10.2026 are 73 hours, since summer time ended on 25.10. (#1896)
  describe('across the end of summer time', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 9, 26, 10));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should count calendar days, not periods of 24 hours', () => {
      expect(pipe.transform(new Date(2026, 9, 23, 10))).toBe(true);
      expect(pipe.transform(new Date(2026, 9, 22, 10))).toBe(false);
    });
  });

  it('should return false for a date from 4 days ago', () => {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    expect(pipe.transform(fourDaysAgo)).toBe(false);
  });

  it('should handle date strings', () => {
    expect(pipe.transform(new Date().toISOString())).toBe(true);
  });
});
