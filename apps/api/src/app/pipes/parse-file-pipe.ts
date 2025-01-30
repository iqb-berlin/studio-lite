import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException
} from '@nestjs/common';

@Injectable()
export class ParseFile implements PipeTransform {
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
