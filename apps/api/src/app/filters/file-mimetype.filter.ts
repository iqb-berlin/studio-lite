import { UnsupportedMediaTypeException } from '@nestjs/common';

/**
 * A multer file filter that accepts an upload only if its mime type contains one of the given
 * strings, and answers 415 otherwise. Matching by substring rather than equality is what lets a
 * single `application/zip` cover the spellings browsers actually send (see `ZIP_MIME_TYPES`).
 */
export function fileMimetypeFilter(...mimetypes: string[]) {
  return (
    req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void
  ) => {
    if (mimetypes.some(mimetype => file.mimetype.includes(mimetype))) {
      callback(null, true);
    } else {
      callback(
        new UnsupportedMediaTypeException(
          `File type is not matching: ${mimetypes.join(', ')}`
        ),
        false
      );
    }
  };
}
