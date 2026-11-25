/** A point at a distance from 0/0, at an angle from straight up, clockwise, in SVG coordinates. */
const polar = (length: number, degrees: number): [number, number] => {
  const radians = (degrees * Math.PI) / 180;
  return [length * Math.sin(radians), -length * Math.cos(radians)];
};

const svgPoint = ([x, y]: [number, number]): string => `${x.toFixed(2)} ${y.toFixed(2)}`;

/**
 * A snow crystal as one SVG path, around 0/0 in a box of 22 by 22: six arms 60 degrees apart, as snow
 * crystals grow, each with a short pair of side branches pointing outwards. The branches sit near the
 * tip and stay short, so that at the size of a falling flake the arms still read as arms, not as a ring.
 */
export function snowCrystalPath(): string {
  return [0, 60, 120, 180, 240, 300]
    .map(angle => {
      const [branchX, branchY] = polar(6, angle);
      const branchTip = (side: number): [number, number] => {
        const [dx, dy] = polar(3, angle + side * 45);
        return [branchX + dx, branchY + dy];
      };
      const branchStart = svgPoint([branchX, branchY]);
      return `M0 0L${svgPoint(polar(10, angle))}` +
        `M${branchStart}L${svgPoint(branchTip(-1))}M${branchStart}L${svgPoint(branchTip(1))}`;
    })
    .join('');
}
