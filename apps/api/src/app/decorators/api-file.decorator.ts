import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * One decorator for an upload route: it installs multer's file interceptor and, in the same move,
 * tells swagger that the route consumes `multipart/form-data` with a binary field of that name.
 * Applied separately, the two regularly drift apart -- the route works and the documented body is
 * wrong, or the other way round.
 *
 * @param fieldName Name of the form field carrying the file.
 * @param required Whether swagger should mark the field as required.
 * @param localOptions Multer options, e.g. a mime-type filter (see `fileMimetypeFilter`).
 */
export function ApiFile(
  fieldName: string = 'file',
  required: boolean = false,
  localOptions?: MulterOptions
) {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    })
  );
}
