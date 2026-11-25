import { Flake, randomFlake } from './snow-flake.utils';

describe('randomFlake', () => {
  // the lowest and the highest number Math.random answers, and a run of real ones
  const lowest = () => 0;
  const highest = () => 1 - Number.EPSILON;
  const flakes: Flake[] = [
    randomFlake(lowest),
    randomFlake(highest),
    ...Array.from({ length: 500 }, () => randomFlake())
  ];

  const px = (value: string): number => Number(value.replace(/px$/, ''));
  const seconds = (value: string): number => Number(value.replace(/s$/, ''));

  it('starts no flake outside the page: at most its own width short of the right edge', () => {
    flakes.forEach(flake => {
      const [, width, share] = /^calc\(\(100% - ([\d.]+)px\) \* ([\d.e-]+)\)$/.exec(flake.left) ?? [];
      expect(Number(width)).toBe(px(flake.size));
      expect(Number(share)).toBeGreaterThanOrEqual(0);
      expect(Number(share)).toBeLessThan(1);
    });
  });

  // a negative delay starts a flake part of the way down, so the snow does not begin as one row
  it('starts every flake at most one fall into its way down, never later', () => {
    flakes.forEach(flake => {
      expect(seconds(flake.delay)).toBeLessThanOrEqual(0);
      expect(-seconds(flake.delay)).toBeLessThanOrEqual(seconds(flake.duration));
    });
  });

  // the dots are the snow further away
  it('draws every crystal larger than any dot', () => {
    const crystals = flakes.filter(flake => flake.crystal).map(flake => px(flake.size));
    const dots = flakes.filter(flake => !flake.crystal).map(flake => px(flake.size));
    expect(crystals.length).toBeGreaterThan(0);
    expect(dots.length).toBeGreaterThan(0);
    expect(Math.min(...crystals)).toBeGreaterThan(Math.max(...dots));
  });
});
