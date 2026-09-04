import { WebColors } from './web-colors';

describe('WebColors', () => {
  it('returns the hex value for a lowercase color name', () => {
    const hex = WebColors.getHexFromWebColor('lavender');

    expect(hex).toBe('E6E6FA');
  });

  it('returns the hex value of every colour it knows', () => {
    expect(WebColors.getHexFromWebColor('lime')).toBe('00FF00');
  });

  it('returns an empty string for unknown colors', () => {
    const hex = WebColors.getHexFromWebColor('not-a-color');

    expect(hex).toBe('');
  });

  it('requires lowercase input to match color names', () => {
    const hex = WebColors.getHexFromWebColor('Lavender');

    expect(hex).toBe('');
  });
});
