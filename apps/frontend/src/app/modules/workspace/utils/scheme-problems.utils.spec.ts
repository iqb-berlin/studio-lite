import { schemeProblemFinding } from './scheme-problems.utils';

// what the schemer finds is tested in libs/shared-code (scheme-problems.spec.ts); here, how it is named
describe('schemeProblemFinding', () => {
  it('names a problem by its text, filled with the variable', () => {
    expect(schemeProblemFinding({ type: 'NAME_TWICE', variable: 'text_1' })).toEqual({
      key: 'unit-check.scheme-problem.NAME_TWICE', params: { variable: 'text_1' }
    });
  });

  it('names a scheme it cannot read without a variable', () => {
    expect(schemeProblemFinding({ type: 'UNREADABLE' })).toEqual({ key: 'unit-check.scheme-unreadable' });
  });
});
