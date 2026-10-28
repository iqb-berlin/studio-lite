import 'reflect-metadata';
import { DECORATORS } from '@nestjs/swagger';
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

  // the report's own problem next to those of the coding scheme spec (#1873)
  it('lists codes without rules among the problem types', () => {
    expect(CODING_SCHEME_PROBLEM_TYPES).toEqual(expect.arrayContaining(['VACANT', 'CODE_WITHOUT_RULES']));
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
