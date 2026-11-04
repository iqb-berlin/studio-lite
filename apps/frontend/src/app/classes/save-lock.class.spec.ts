import { SaveLock } from './save-lock.class';

describe('SaveLock', () => {
  it('locks while a save is under way and begins no second one', () => {
    const lock = new SaveLock();

    expect(lock.start({ name: 'a' })).toBe(true);
    expect(lock.saving()).toBe(true);
    expect(lock.start({ name: 'b' })).toBe(false);
    expect(lock.differsFromSent({ name: 'a' })).toBe(false);
  });

  it('is released by the end of a save, whether it succeeded or not', () => {
    const lock = new SaveLock();
    lock.start({ name: 'a' });

    lock.finish();

    expect(lock.saving()).toBe(false);
    expect(lock.start({ name: 'b' })).toBe(true);
  });

  it('tells what was entered after sending from what was sent', () => {
    const lock = new SaveLock();
    lock.start({ name: 'a', units: [1] });
    lock.finish();

    expect(lock.differsFromSent({ name: 'a', units: [1] })).toBe(false);
    expect(lock.differsFromSent({ name: 'a', units: [1, 2] })).toBe(true);
  });
});
