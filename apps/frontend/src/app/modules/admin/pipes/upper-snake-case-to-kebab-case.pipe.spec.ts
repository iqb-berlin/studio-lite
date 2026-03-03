import { UpperSnakeCaseToKebabCasePipe } from './upper-snake-case-to-kebab-case.pipe';

describe('UpperSnakeCaseToKebabCasePipe', () => {
  it('create an instance', () => {
    const pipe = new UpperSnakeCaseToKebabCasePipe();
    expect(pipe).toBeTruthy();
  });

  it('should transform UPPER_SNAKE_CASE to kebab-case', () => {
    const pipe = new UpperSnakeCaseToKebabCasePipe();
    expect(pipe.transform('PERIODIC_TABLE')).toBe('periodic-table');
    expect(pipe.transform('MOLECULE_EDITOR')).toBe('molecule-editor');
    expect(pipe.transform('CALC')).toBe('calc');
    expect(pipe.transform('TEST_WIDGET_MODEL')).toBe('test-widget-model');
  });

  it('should handle empty or null input safely', () => {
    const pipe = new UpperSnakeCaseToKebabCasePipe();
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null as unknown as string)).toBe('');
    expect(pipe.transform(undefined as unknown as string)).toBe('');
  });
});
