import { isCopyBody, isSubmissionBody, sourceUnitIdsOf } from './unit-request-body';

describe('unit request body', () => {
  describe('isCopyBody', () => {
    it('should take a body that says whether to take the comments along for a copy', () => {
      expect(isCopyBody({ ids: [1], addComments: false })).toBe(true);
    });

    it.each([[{ key: 'U1' }], [{ key: 'U1', createFrom: 1 }], [null], ['addComments'], [undefined]])(
      'should not take %p for a copy',
      body => {
        expect(isCopyBody(body)).toBe(false);
      }
    );
  });

  describe('isSubmissionBody', () => {
    it('should take a body with a target for a submission', () => {
      expect(isSubmissionBody({ ids: [1], targetId: 7 })).toBe(true);
    });

    it.each([[{ ids: [1] }], [null], ['targetId'], [undefined]])(
      'should take %p for a return',
      body => {
        expect(isSubmissionBody(body)).toBe(false);
      }
    );
  });

  describe('sourceUnitIdsOf', () => {
    it('should read the units of a copy', () => {
      expect(sourceUnitIdsOf({ ids: [10, '11'], addComments: true })).toEqual([10, 11]);
    });

    it('should read the units of a copy, not a createFrom sent along', () => {
      expect(sourceUnitIdsOf({ ids: [10], addComments: true, createFrom: 12 })).toEqual([10]);
    });

    it('should read the unit to create from', () => {
      expect(sourceUnitIdsOf({ key: 'U1', createFrom: 12 })).toEqual([12]);
    });

    it.each([[{ key: 'U1' }], [{ key: 'U1', createFrom: 0 }], [{ key: 'U1', createFrom: null }], [null]])(
      'should find no source in %p',
      body => {
        expect(sourceUnitIdsOf(body)).toEqual([]);
      }
    );

    it.each([[{ key: 'U1', createFrom: 'abc' }, [0]], [{ ids: 'x', addComments: true }, [0]]])(
      'should read a malformed source in %p as 0',
      (body, ids) => {
        expect(sourceUnitIdsOf(body)).toEqual(ids);
      }
    );
  });
});
