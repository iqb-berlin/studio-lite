import { IsInArrayPipe } from './is-in-array.pipe';

describe('IsInArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new IsInArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
