import { IsActivePrintOption } from './is-active-print-option.pipe';
import { PrintOptions } from '../modules/print/models/print-options.interface';

describe('IsActivePrintOption', () => {
  const pipe = new IsActivePrintOption();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if option is active', () => {
    const options: PrintOptions[] = [{ key: 'printComments', value: true }];
    expect(pipe.transform(options, 'printComments')).toBe(true);
  });

  it('should return false if option is inactive', () => {
    const options: PrintOptions[] = [{ key: 'printComments', value: false }];
    expect(pipe.transform(options, 'printComments')).toBe(false);
  });

  it('should return false if option is not found', () => {
    const options: PrintOptions[] = [{ key: 'printMetadata', value: true }];
    expect(pipe.transform(options, 'printComments')).toBe(false);
  });
});
