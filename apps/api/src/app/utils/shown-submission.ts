import UnitDropBoxHistory from '../entities/unit-drop-box-history.entity';

/**
 * Which of the submissions of a unit the list of a workspace tells about: the latest one into the
 * workspace not returned yet -- the one returning it undoes (#1806) -- else the latest one into or
 * out of it. A unit sent on from a drop box and returned there has one of each; the list took the one
 * the database gave first, in no order it was asked for (#2232).
 */
export function shownSubmission(
  submissions: UnitDropBoxHistory[],
  workspaceId: number
): UnitDropBoxHistory | undefined {
  const latestFirst = [...submissions]
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  return latestFirst.find(submission => submission.targetWorkspaceId === workspaceId && !submission.returned) ??
    latestFirst[0];
}
