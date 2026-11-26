import { snowCrystalPath } from './snow-crystal.utils';

describe('snowCrystalPath', () => {
  type Point = { x: number; y: number };
  type Line = { from: Point; to: Point };

  // the path is drawn as separate lines, each "M x y L x y"
  const lines = (): Line[] => [...snowCrystalPath().matchAll(/M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/g)]
    .map(([, x1, y1, x2, y2]) => ({
      from: { x: Number(x1), y: Number(y1) },
      to: { x: Number(x2), y: Number(y2) }
    }));
  const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
  const centre: Point = { x: 0, y: 0 };
  // as angles from straight up, clockwise
  const angle = ({ x, y }: Point): number => Math.round(((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360);
  const arms = (): Line[] => lines().filter(line => distance(line.from, centre) < 0.01);

  // a snow crystal has six arms, not four or eight as a star or an asterisk
  it('draws six arms from the centre, 60 degrees apart', () => {
    expect(arms().map(arm => angle(arm.to))).toEqual([0, 60, 120, 180, 240, 300]);
  });

  it('gives every arm a pair of side branches that grow outwards from it, one to each side', () => {
    const branches = lines().filter(line => distance(line.from, centre) >= 0.01);
    expect(branches).toHaveLength(12);
    arms().forEach(arm => {
      const armAngle = angle(arm.to);
      const own = branches.filter(branch => angle(branch.from) === armAngle);
      expect(own).toHaveLength(2);
      own.forEach(branch => {
        // on the arm, between the centre and its tip
        expect(distance(branch.from, centre)).toBeLessThan(distance(arm.to, centre));
        expect(distance(branch.to, centre)).toBeGreaterThan(distance(branch.from, centre));
      });
      // one to each side of the arm
      const sides = own.map(branch => Math.sign(((angle(branch.to) - armAngle + 540) % 360) - 180));
      expect(sides.sort()).toEqual([-1, 1]);
    });
  });
});
