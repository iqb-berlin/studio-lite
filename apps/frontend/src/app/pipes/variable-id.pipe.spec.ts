import { VariableIdPipe } from './variable-id.pipe';
import { AliasId } from '../modules/metadata/models/alias-id.interface';

describe('VariableIdPipe', () => {
  const pipe = new VariableIdPipe();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return alias if ID is found in aliasIds', () => {
    const aliasIds: AliasId[] = [
      { id: 'v1', alias: 'Alias 1' },
      { id: 'v2', alias: 'Alias 2' }
    ];
    expect(pipe.transform('v1', 'Fallback', aliasIds)).toBe('Alias 1');
  });

  it('should return fallback alias if ID is not found in aliasIds', () => {
    const aliasIds: AliasId[] = [
      { id: 'v1', alias: 'Alias 1' }
    ];
    expect(pipe.transform('v2', 'Fallback', aliasIds)).toBe('Fallback');
  });

  it('should return fallback alias if aliasIds is undefined', () => {
    expect(pipe.transform('v1', 'Fallback', undefined)).toBe('Fallback');
  });

  it('should return "-" if ID is not found and no alias is provided', () => {
    expect(pipe.transform('v1', null, undefined)).toBe('-');
  });

  it('should return "-" if ID is null', () => {
    expect(pipe.transform(null, 'Fallback', undefined)).toBe('Fallback');
    expect(pipe.transform(null, null, undefined)).toBe('-');
  });
});
