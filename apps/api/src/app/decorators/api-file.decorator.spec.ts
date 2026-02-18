import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiFile } from './api-file.decorator';

jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn(),
  UseInterceptors: jest.fn()
}));

jest.mock('@nestjs/platform-express', () => ({
  FileInterceptor: jest.fn()
}));

jest.mock('@nestjs/swagger', () => ({
  ApiBody: jest.fn(),
  ApiConsumes: jest.fn()
}));

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
