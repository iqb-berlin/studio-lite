import { readXsdBoolean } from './xsd-boolean';

describe('readXsdBoolean', () => {
  it.each(['true', '1', ' true '])('should read %p as true', text => {
    expect(readXsdBoolean(text)).toBe(true);
  });

  it.each(['false', '0', '', 'yes', undefined])('should read %p as false', text => {
    expect(readXsdBoolean(text)).toBe(false);
  });
});
