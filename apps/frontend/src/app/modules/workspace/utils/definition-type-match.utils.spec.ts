import { matchDefinitionType } from './definition-type-match.utils';

describe('matchDefinitionType', () => {
  const aspectModel = 'aspect-unit-definition@>=4.0 <=4.12';

  describe('when a side gives no value', () => {
    it('should be unknown without a unit type or a model', () => {
      expect(matchDefinitionType(undefined, undefined)).toBe('unknown');
      expect(matchDefinitionType('', '')).toBe('unknown');
    });

    it('should be unknown when only the module declares a model', () => {
      expect(matchDefinitionType(undefined, aspectModel)).toBe('unknown');
      expect(matchDefinitionType(null, aspectModel)).toBe('unknown');
    });

    it('should be unknown when only the unit has a type', () => {
      expect(matchDefinitionType('aspect-unit-definition@4.12.0', '')).toBe('unknown');
      expect(matchDefinitionType('aspect-unit-definition@4.12.0', undefined)).toBe('unknown');
    });
  });

  describe('when both sides are known', () => {
    it('should accept a version inside the range of the aspect modules', () => {
      expect(matchDefinitionType('aspect-unit-definition@4.12.0', aspectModel)).toBe('compatible');
      expect(matchDefinitionType('aspect-unit-definition@4.0.0', aspectModel)).toBe('compatible');
      expect(matchDefinitionType('aspect-unit-definition@4.7.3', aspectModel)).toBe('compatible');
    });

    it('should read an upper bound without patch as covering every patch of it', () => {
      expect(matchDefinitionType('aspect-unit-definition@4.12.9', aspectModel)).toBe('compatible');
    });

    it('should reject a version above or below the range', () => {
      expect(matchDefinitionType('aspect-unit-definition@4.13.0', aspectModel)).toBe('incompatible');
      expect(matchDefinitionType('aspect-unit-definition@5.0.0', aspectModel)).toBe('incompatible');
      expect(matchDefinitionType('aspect-unit-definition@3.9.0', aspectModel)).toBe('incompatible');
    });

    it('should reject a format of another name', () => {
      expect(matchDefinitionType('aspect-unit-definition@4.12.0', 'iqb-speedtest@>=1.0'))
        .toBe('incompatible');
    });

    it('should read a model without operator as every version it names', () => {
      expect(matchDefinitionType('iqb-aspect@12.5.3', 'iqb-aspect@12.5')).toBe('compatible');
      expect(matchDefinitionType('iqb-aspect@12.6.0', 'iqb-aspect@12.5')).toBe('incompatible');
    });

    it('should treat > and < as excluding what the bound names', () => {
      expect(matchDefinitionType('f@4.12.5', 'f@>4.12')).toBe('incompatible');
      expect(matchDefinitionType('f@4.13.0', 'f@>4.12')).toBe('compatible');
      expect(matchDefinitionType('f@4.12.0', 'f@<4.12')).toBe('incompatible');
      expect(matchDefinitionType('f@4.11.9', 'f@<4.12')).toBe('compatible');
    });

    it('should accept a blank between operator and version', () => {
      expect(matchDefinitionType('f@4.5.0', 'f@>= 4.0 <= 4.12')).toBe('compatible');
    });

    it('should accept any of several alternatives', () => {
      expect(matchDefinitionType('f@2.1.0', 'f@1.x || >=2.0 <3')).toBe('unknown');
      expect(matchDefinitionType('f@2.1.0', 'f@<1.5 || >=2.0 <3')).toBe('compatible');
      expect(matchDefinitionType('f@1.7.0', 'f@<1.5 || >=2.0 <3')).toBe('incompatible');
    });
  });

  describe('when a value cannot be read', () => {
    it('should be unknown for a model without version, like a widget model', () => {
      expect(matchDefinitionType('aspect-unit-definition@4.12.0', 'MOLECULE_EDITOR')).toBe('unknown');
    });

    it('should be unknown for range syntax it does not understand', () => {
      expect(matchDefinitionType('f@4.1.0', 'f@^4.0')).toBe('unknown');
      expect(matchDefinitionType('f@4.1.0', 'f@~4.0')).toBe('unknown');
      expect(matchDefinitionType('f@4.1.0', 'f@4.0 - 4.12')).toBe('unknown');
    });

    it('should be unknown for a unit type it cannot read', () => {
      expect(matchDefinitionType('aspect-unit-definition', aspectModel)).toBe('unknown');
      expect(matchDefinitionType('aspect-unit-definition@4.12.0-beta', aspectModel)).toBe('unknown');
      expect(matchDefinitionType('@4.12.0', aspectModel)).toBe('unknown');
    });

    it('should be unknown for an unreadable range even when the names differ', () => {
      expect(matchDefinitionType('aspect-unit-definition@4.12.0', 'aspect@model-3.0.0')).toBe('unknown');
    });
  });
});
