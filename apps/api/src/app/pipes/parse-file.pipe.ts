import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException
} from '@nestjs/common';

/**
 * Turns "no file was uploaded" into a 400 before the handler runs. Without it an upload route with
 * an empty body reaches the service, which then fails on an undefined file somewhere deeper, where
 * the cause is no longer visible.
 */
@Injectable()
export class ParseFilePipe implements PipeTransform {
  /** Passes the upload through, or rejects a missing file and an empty array of files. */
  // eslint-disable-next-line class-methods-use-this
  transform(
    files: Express.Multer.File | Express.Multer.File[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata
  ): Express.Multer.File | Express.Multer.File[] {
    if (files === undefined || files === null) {
      throw new BadRequestException('Validation failed (file expected)');
    }

    if (Array.isArray(files) && files.length === 0) {
      throw new BadRequestException('Validation failed (files expected)');
    }

    return files;
  }
}
