import { UnitDefinitionDto } from '@studio-lite-lib/api-dto';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitDefinitionStore } from './unit-definition-store';

const buildVariable = (id: string, alias: string): VariableInfo => ({
  id,
  alias,
  type: 'string',
  format: 'text-selection',
  multiple: false,
  nullable: false,
  values: [],
  valuePositionLabels: []
});

describe('UnitDefinitionStore', () => {
  it('tracks changes and emits on setData', () => {
    const original: UnitDefinitionDto = {
      variables: [buildVariable('v1', 'a1')],
      definition: 'def-a'
    };
    const store = new UnitDefinitionStore(1, original);
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);

    store.setData([buildVariable('v2', 'a2')], 'def-b');

    expect(store.isChanged()).toBe(true);
    expect(store.getChangedData()).toEqual({
      variables: [buildVariable('v2', 'a2')],
      definition: 'def-b'
    });
    expect(store.getData()).toEqual({
      variables: [buildVariable('v2', 'a2')],
      definition: 'def-b'
    });
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('clears changes when values match original', () => {
    const originalVars = [buildVariable('v1', 'a1')];
    const original: UnitDefinitionDto = {
      variables: originalVars,
      definition: 'def-a'
    };
    const store = new UnitDefinitionStore(1, original);

    store.setData([buildVariable('v2', 'a2')], 'def-b');
    store.setData([...originalVars], 'def-a');

    expect(store.isChanged()).toBe(false);
    expect(store.getChangedData()).toEqual({});
  });

  it('applyChanges persists merged data and resets state', () => {
    const original: UnitDefinitionDto = {
      variables: [buildVariable('v1', 'a1')],
      definition: 'def-a'
    };
    const store = new UnitDefinitionStore(1, original);

    store.setData([buildVariable('v2', 'a2')], 'def-b');
    store.applyChanges();

    expect(store.isChanged()).toBe(false);
    expect(store.getData()).toEqual({
      variables: [buildVariable('v2', 'a2')],
      definition: 'def-b'
    });
  });

  it('restore resets change set and emits', () => {
    const original: UnitDefinitionDto = {
      variables: [buildVariable('v1', 'a1')],
      definition: 'def-a'
    };
    const store = new UnitDefinitionStore(1, original);
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);

    store.setData([buildVariable('v2', 'a2')], 'def-b');
    store.restore();

    expect(store.isChanged()).toBe(false);
    expect(store.getChangedData()).toEqual({});
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });

  // An editor following VariableInfo 2.0 writes type and format in upper case and leaves out
  // `page`. Studio stores and hands on the 1.x spelling, which the schemer and coding-box read (#1606).
  describe('with an editor in the VariableInfo 2.0 spelling', () => {
    /** A stored entry as a 1.x editor wrote it, `page` in the middle as aspect has it. */
    const storedV1 = (): VariableInfo => ({
      id: 'v1',
      alias: 'a1',
      type: 'no-value',
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    });
    /** The same entry from a 2.0 editor: upper case, no `page`. */
    const sentV2 = (type = 'NO_VALUE') => ({
      id: 'v1',
      alias: 'a1',
      type,
      format: '',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      valuesComplete: false
    });

    it('does not mark a unit as changed when the editor reports its unchanged list', () => {
      const store = new UnitDefinitionStore(1, { variables: [storedV1()], definition: 'def-a' });

      store.setData([sentV2()], 'def-a');

      expect(store.isChanged()).toBe(false);
      expect(store.getChangedData()).toEqual({});
    });

    it('keeps a changed list in the 1.x spelling, with the page restored', () => {
      const store = new UnitDefinitionStore(1, { variables: [storedV1()], definition: 'def-a' });

      store.setData([sentV2('STRING')], 'def-a');

      expect(store.getChangedData().variables).toEqual([{ ...storedV1(), type: 'string' }]);
    });

    it('still tells a missing list from an empty one', () => {
      const store = new UnitDefinitionStore(1, { variables: [], definition: 'def-a' });

      store.setData(undefined as unknown as VariableInfo[], 'def-a');

      expect(store.isChanged()).toBe(true);
    });
  });
});
