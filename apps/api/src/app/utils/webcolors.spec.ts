import { WebColors } from './webcolors';

describe('WebColors', () => {
  beforeEach(() => {
    WebColors.hex = '';
  });

  it('returns the hex value for a lowercase color name', () => {
    const hex = WebColors.getHexFromWebColor('lavender');

    expect(hex).toBe('E6E6FA');
  });

  it('updates the cached hex value when a color is found', () => {
    WebColors.getHexFromWebColor('lime');

    expect(WebColors.hex).toBe('00FF00');
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

