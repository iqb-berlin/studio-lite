import { jest } from '@jest/globals';

// ESM module namespaces are frozen, so `jest.mock()` cannot replace exports after the fact.
// `unstable_mockModule` registers the replacement before the module is pulled in, which means
// every import below has to be dynamic and come after these calls.
jest.unstable_mockModule('@nestjs/common', () => ({
  applyDecorators: jest.fn(),
  UseInterceptors: jest.fn()
}));

jest.unstable_mockModule('@nestjs/platform-express', () => ({
  FileInterceptor: jest.fn()
}));

jest.unstable_mockModule('@nestjs/swagger', () => ({
  ApiBody: jest.fn(),
  ApiConsumes: jest.fn()
}));

const { applyDecorators, UseInterceptors } = await import('@nestjs/common');
const { FileInterceptor } = await import('@nestjs/platform-express');
const { ApiBody, ApiConsumes } = await import('@nestjs/swagger');
const { ApiFile } = await import('./api-file.decorator');

describe('ApiFileDecorator', () => {
  it('should call applyDecorators with correct interceptors and swagger decorators', () => {
    const fieldName = 'testFile';
    const localOptions = { dest: 'uploads/' };

    ApiFile(fieldName, true, localOptions);

    expect(FileInterceptor).toHaveBeenCalledWith(fieldName, localOptions);
    expect(UseInterceptors).toHaveBeenCalled();
    expect(ApiConsumes).toHaveBeenCalledWith('multipart/form-data');
    expect(ApiBody).toHaveBeenCalledWith({
      schema: {
        type: 'object',
        required: [fieldName],
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    });
    expect(applyDecorators).toHaveBeenCalled();
  });

  it('should use default fieldName if not provided', () => {
    ApiFile();

    expect(FileInterceptor).toHaveBeenCalledWith('file', undefined);
    expect(ApiBody).toHaveBeenCalledWith(expect.objectContaining({
      schema: expect.objectContaining({
        required: []
      })
    }));
  });
});
