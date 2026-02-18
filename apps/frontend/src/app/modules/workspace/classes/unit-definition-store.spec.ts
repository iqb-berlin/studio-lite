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
});
