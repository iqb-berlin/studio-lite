import { FullTimestampPipe } from "./full-timestamp.pipe";

describe('FullTimestampPipe', () => {
  it('create an instance', () => {
    const pipe = new FullTimestampPipe();
    expect(pipe).toBeTruthy();
  });
});
