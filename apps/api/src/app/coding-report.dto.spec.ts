import 'reflect-metadata';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import {
  CODING_SCHEME_PROBLEM_TYPES,
  CodingReportDto,
  CodingReportValidationProblemDto
} from '@studio-lite-lib/api-dto';

describe('CodingReportDto Swagger metadata', () => {
  it('describes validation problem types as a string enum', () => {
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      CodingReportValidationProblemDto.prototype,
      'type'
    );

    expect(metadata).toMatchObject({
      type: 'string',
      enum: CODING_SCHEME_PROBLEM_TYPES
    });
  });

  it('keeps validationProblems optional for compatibility with older APIs', () => {
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      CodingReportDto.prototype,
      'validationProblems'
    );

    expect(metadata.required).toBe(false);
  });
});
