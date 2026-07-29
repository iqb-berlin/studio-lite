import { ZIP_MIME_TYPES } from './zip-mime-types';

describe('ZIP_MIME_TYPES', () => {
  it('accepts the mime type sent by Linux and macOS', () => {
    expect(ZIP_MIME_TYPES).toContain('application/zip');
  });

  it('accepts the mime type sent by Windows', () => {
    expect(ZIP_MIME_TYPES).toContain('application/x-zip-compressed');
  });

  it('accepts the legacy multipart zip mime type', () => {
    expect(ZIP_MIME_TYPES).toContain('multipart/x-zip');
  });
});
