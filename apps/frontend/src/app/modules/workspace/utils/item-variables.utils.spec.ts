import { reconcileItemVariable, reconcileItemVariables } from './item-variables.utils';

const variables = [{ id: 'text_1', alias: 'Antwort' }, { id: 'sum', alias: 'Summe' }];

describe('reconcileItemVariable', () => {
  it('takes over an alias renamed since', () => {
    expect(reconcileItemVariable({ variableReadOnlyId: 'text_1', variableId: 'old alias' }, variables))
      .toEqual({ variableReadOnlyId: 'text_1', variableId: 'Antwort' });
  });

  it('removes the assignment to a variable that is gone', () => {
    expect(reconcileItemVariable({ variableReadOnlyId: 'gone', variableId: 'Gone' }, variables))
      .toEqual({ variableReadOnlyId: null, variableId: null });
  });

  it('reads older metadata, which names the variable by variableId alone', () => {
    expect(reconcileItemVariable({ variableId: 'sum' }, variables))
      .toEqual({ variableReadOnlyId: 'sum', variableId: 'Summe' });
  });

  it('leaves an item without a variable as it is', () => {
    expect(reconcileItemVariable({}, variables)).toEqual({ variableReadOnlyId: undefined, variableId: undefined });
  });
});

describe('reconcileItemVariables', () => {
  it('returns the metadata with the changed items, keeping the others', () => {
    const unchanged = {
      id: 'A2', uuid: 'u2', variableReadOnlyId: 'sum', variableId: 'Summe'
    };
    const renamed = {
      id: 'A1', uuid: 'u1', variableReadOnlyId: 'text_1', variableId: 'old alias'
    };
    const metadata = { profiles: [], items: [renamed, unchanged] };

    const reconciled = reconcileItemVariables(metadata, variables);

    expect(reconciled?.items).toEqual([
      { ...renamed, variableId: 'Antwort' },
      unchanged
    ]);
    expect(reconciled?.items?.[1]).toBe(unchanged);
    expect(reconciled?.profiles).toEqual([]);
  });

  it('returns null when nothing needs to change', () => {
    expect(reconcileItemVariables({ items: [{ variableReadOnlyId: 'sum', variableId: 'Summe' }] }, variables))
      .toBeNull();
    expect(reconcileItemVariables({}, variables)).toBeNull();
  });

  it('does not count older metadata that only lacks the id as a change', () => {
    expect(reconcileItemVariables({ items: [{ variableId: 'sum' }] }, [{ id: 'sum', alias: 'sum' }])).toBeNull();
  });
});
