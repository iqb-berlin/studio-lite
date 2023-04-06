import { MomentFromNowPipe } from './moment-from-now.pipe';

describe('MomentFromNowPipe', () => {
  it('create an instance', () => {
    const pipe = new MomentFromNowPipe();
    expect(pipe).toBeTruthy();
  });
});
