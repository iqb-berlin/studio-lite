import { BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ParseFilePipe } from './parse-file.pipe';

describe('ParseFilePipe', () => {
  let pipe: ParseFilePipe;
  let metadata: ArgumentMetadata;
  let parseFileInput: Parameters<ParseFilePipe['transform']>[0];

  beforeEach(() => {
    pipe = new ParseFilePipe();
    metadata = {
      type: 'body',
      metatype: undefined,
      data: undefined
    };
  });

  it('throws when file is undefined', () => {
    expect(() => pipe.transform(undefined, metadata)).toThrow(
      BadRequestException
    );
    expect(() => pipe.transform(undefined, metadata)).toThrow(
      'Validation failed (file expected)'
    );
  });

  it('throws when file is null', () => {
    expect(() => pipe.transform(null, metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform(null, metadata)).toThrow(
      'Validation failed (file expected)'
    );
  });

  it('throws when files array is empty', () => {
    expect(() => pipe.transform([], metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform([], metadata)).toThrow(
      'Validation failed (files expected)'
    );
  });

  it('returns the same file instance', () => {
    const file = {
      originalname: 'test.txt'
    } as unknown as typeof parseFileInput;
    const result = pipe.transform(file, metadata);
    expect(result).toBe(file);
  });

  it('returns the same files array instance', () => {
    const files = [
      { originalname: 'test.txt' }
    ] as unknown as typeof parseFileInput;
    const result = pipe.transform(files, metadata);
    expect(result).toBe(files);
  });
});
