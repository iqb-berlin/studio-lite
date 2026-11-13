import { BadRequestException, CallHandler, ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { firstValueFrom, throwError } from 'rxjs';
import { QueryFailedError } from 'typeorm';
import { ValueTooLongInterceptor } from './value-too-long.interceptor';

describe('ValueTooLongInterceptor', () => {
  const interceptor = new ValueTooLongInterceptor();
  const failingWith = (error: unknown): CallHandler => createMock<CallHandler>({
    handle: () => throwError(() => error)
  });
  const queryFailed = (code: string): QueryFailedError => new QueryFailedError(
    'UPDATE "workspace" SET "name" = $1',
    [],
    Object.assign(new Error(`database error ${code}`), { code })
  );
  const run = (error: unknown): Promise<unknown> => firstValueFrom(
    interceptor.intercept(createMock<ExecutionContext>(), failingWith(error))
  );

  // #2133: the database refused the value, and the user saw a server problem
  it('answers a value longer than its column with 400', async () => {
    await expect(run(queryFailed('22001'))).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([
    ['another database error', queryFailed('23503')],
    ['an error that is no database error', new Error('down')]
  ])('passes %s through unchanged', async (_, error) => {
    await expect(run(error)).rejects.toBe(error);
  });
});
