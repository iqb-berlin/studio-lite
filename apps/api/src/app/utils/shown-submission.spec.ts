import UnitDropBoxHistory from '../entities/unit-drop-box-history.entity';
import { shownSubmission } from './shown-submission';

const submission = (
  sourceWorkspaceId: number,
  targetWorkspaceId: number,
  returned: boolean,
  day: number
): UnitDropBoxHistory => ({
  id: day, unitId: 1, sourceWorkspaceId, targetWorkspaceId, returned, changedAt: new Date(2026, 10, day)
});

describe('shownSubmission', () => {
  // submitted from 1 to the drop box 2, sent on to its drop box 3 and returned from there (#2232)
  it('should tell about the submission still to be returned, though a later one came back', () => {
    const intoDropBox = submission(1, 2, false, 1);

    expect(shownSubmission([submission(2, 3, true, 3), intoDropBox], 2)).toBe(intoDropBox);
  });

  it('should take the latest submission when none into the workspace waits to be returned', () => {
    const latest = submission(2, 3, true, 5);

    expect(shownSubmission([submission(1, 2, true, 2), latest, submission(2, 3, true, 4)], 2)).toBe(latest);
  });

  it('should tell about none without a submission', () => {
    expect(shownSubmission([], 2)).toBeUndefined();
  });
});
