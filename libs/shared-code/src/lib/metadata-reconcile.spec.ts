import { ProfileReconcileOps, mergeProfile, reconcileProfilesByProfileId } from './metadata-reconcile';

interface TestProfile {
  id: number;
  profileId?: string;
  createdAt?: Date;
  order?: number;
  entries?: string[];
}

function makeOps(): ProfileReconcileOps<TestProfile> & {
  removed: number[];
  updated: { id: number; metadata: TestProfile }[];
  added: TestProfile[];
} {
  const removed: number[] = [];
  const updated: { id: number; metadata: TestProfile }[] = [];
  const added: TestProfile[] = [];
  return {
    removed,
    updated,
    added,
    remove: async (id: number) => { removed.push(id); },
    update: async (id: number, metadata: TestProfile) => { updated.push({ id, metadata }); },
    add: async (metadata: TestProfile) => { added.push(metadata); }
  };
}

describe('mergeProfile', () => {
  it('keeps id/createdAt from the stored row and entries from the incoming payload', () => {
    const created = new Date('2020-01-01');
    const existing: TestProfile = {
      id: 7, profileId: 'p1', createdAt: created, order: 0, entries: ['old']
    };
    const incoming: TestProfile = { id: undefined as unknown as number, profileId: 'p1', entries: ['new'] };

    const merged = mergeProfile(existing, incoming);

    expect(merged.id).toBe(7);
    expect(merged.createdAt).toBe(created);
    expect(merged.entries).toEqual(['new']);
    expect(merged.order).toBe(0); // inherited because incoming omits it
  });

  it('takes order from the incoming payload when present, including -1', () => {
    const existing: TestProfile = { id: 1, profileId: 'p1', order: 0 };
    const incoming: TestProfile = { id: 1, profileId: 'p1', order: -1 };

    expect(mergeProfile(existing, incoming).order).toBe(-1);
  });
});

describe('reconcileProfilesByProfileId', () => {
  it('updates matches by profileId, removes gone rows, inserts new ones', async () => {
    const ops = makeOps();
    const existing: TestProfile[] = [
      { id: 2, profileId: 'p1' },
      { id: 3, profileId: 'p2' }
    ];
    const incoming: TestProfile[] = [
      { id: undefined as unknown as number, profileId: 'p1', entries: ['x'] }, // edit -> update id 2
      { id: undefined as unknown as number, profileId: 'p3', entries: ['y'] } // new -> add
    ];

    await reconcileProfilesByProfileId(existing, incoming, ops);

    expect(ops.updated.map(u => u.id)).toEqual([2]);
    expect(ops.added.map(a => a.profileId)).toEqual(['p3']);
    expect(ops.removed).toEqual([3]); // p2 no longer present
  });

  it('clears all stored rows when the incoming array is genuinely empty', async () => {
    const ops = makeOps();
    const existing: TestProfile[] = [{ id: 2, profileId: 'p1' }, { id: 3, profileId: 'p2' }];

    await reconcileProfilesByProfileId(existing, [], ops);

    expect(ops.removed.sort()).toEqual([2, 3]);
    expect(ops.added).toEqual([]);
    expect(ops.updated).toEqual([]);
  });

  it('never removes or inserts when an incoming profile has no profileId', async () => {
    // Regression: an undefined profileId must not poison the match set and wipe
    // every stored row.
    const ops = makeOps();
    const existing: TestProfile[] = [
      { id: 2, profileId: 'p1' },
      { id: 3, profileId: 'p2' }
    ];
    const incoming: TestProfile[] = [{ id: undefined as unknown as number, entries: ['x'] }];

    await reconcileProfilesByProfileId(existing, incoming, ops);

    expect(ops.removed).toEqual([]);
    expect(ops.added).toEqual([]);
    expect(ops.updated).toEqual([]);
  });
});
