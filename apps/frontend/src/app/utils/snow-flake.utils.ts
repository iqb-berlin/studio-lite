/** One falling flake, its values as CSS lengths, times and angles, as a template binds them. */
export interface Flake {
  /** A six-armed snow crystal; otherwise a round dot, snow further away. */
  crystal: boolean;
  left: string;
  size: string;
  opacity: string;
  duration: string;
  delay: string;
  drift: string;
  spin: string;
}

const CRYSTAL_SHARE = 0.6;

/**
 * A flake with a random place, size, speed and sway. `random` answers a number from 0 up to, not
 * including, 1, as `Math.random` does.
 */
export function randomFlake(random: () => number = Math.random): Flake {
  const between = (min: number, max: number): number => min + random() * (max - min);
  const crystal = random() < CRYSTAL_SHARE;
  const duration = between(8, 18);
  const size = crystal ? between(12, 20) : between(3, 6);
  return {
    crystal,
    // somewhere in the width that is left beside the flake, so that none starts outside the page
    left: `calc((100% - ${size}px) * ${between(0, 1)})`,
    size: `${size}px`,
    opacity: `${between(0.5, 0.95)}`,
    duration: `${duration}s`,
    // negative: the flake starts part of the way down, so the snow does not begin as one row at the top
    delay: `${-between(0, duration)}s`,
    drift: `${between(-40, 40)}px`,
    // a crystal turns slowly as it falls, either way; a dot shows no turning
    spin: `${between(-360, 360)}deg`
  };
}
