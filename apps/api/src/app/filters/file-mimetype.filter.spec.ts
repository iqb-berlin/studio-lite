import { UnsupportedMediaTypeException } from '@nestjs/common';
import { fileMimetypeFilter } from './file-mimetype.filter';
import { ZIP_MIME_TYPES } from '../constants/zip-mime-types';

describe('fileMimetypeFilter', () => {
  const makeFile = (mimetype: string): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'test.bin',
    encoding: '7bit',
    mimetype,
    size: 1,
    destination: 'dest',
    filename: 'test.bin',
    path: '/tmp/test.bin',
    buffer: Buffer.from('x')
  }) as Express.Multer.File;

  it('accepts when mimetype contains an allowed fragment', () => {
    const filter = fileMimetypeFilter('image/');
    const callback = jest.fn<void, [Error | null, boolean]>();

    filter({}, makeFile('image/png'), callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('accepts when any allowed mimetype matches', () => {
    const filter = fileMimetypeFilter('application/pdf', 'image/');
    const callback = jest.fn<void, [Error | null, boolean]>();

    filter({}, makeFile('image/jpeg'), callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('accepts a zip uploaded from Windows', () => {
    const filter = fileMimetypeFilter(...ZIP_MIME_TYPES);
    const callback = jest.fn<void, [Error | null, boolean]>();

    filter({}, makeFile('application/x-zip-compressed'), callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('accepts a zip uploaded from Linux or macOS', () => {
    const filter = fileMimetypeFilter(...ZIP_MIME_TYPES);
    const callback = jest.fn<void, [Error | null, boolean]>();

    filter({}, makeFile('application/zip'), callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('rejects a non-zip upload when zip mimetypes are required', () => {
    const filter = fileMimetypeFilter(...ZIP_MIME_TYPES);
    const callback = jest.fn<void, [Error | null, boolean]>();

    filter({}, makeFile('application/pdf'), callback);

    expect(callback).toHaveBeenCalledWith(
      expect.any(UnsupportedMediaTypeException),
      false
    );
  });

  it('rejects when mimetype does not match', () => {
    const filter = fileMimetypeFilter('image/png', 'application/pdf');
    const callback = jest.fn<void, [Error | null, boolean]>();

    filter({}, makeFile('text/plain'), callback);

    expect(callback).toHaveBeenCalledWith(
      expect.any(UnsupportedMediaTypeException),
      false
    );
    const error = callback.mock.calls[0][0] as UnsupportedMediaTypeException;
    expect(error.message).toContain('File type is not matching');
  });
});
