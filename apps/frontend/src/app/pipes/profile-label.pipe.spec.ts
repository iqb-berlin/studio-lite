import { ProfileLabelPipe } from './profile-label.pipe';

describe('ProfileLabelPipe', () => {
  const pipe = new ProfileLabelPipe();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return string as is', () => {
    expect(pipe.transform('Test Profile')).toBe('Test Profile');
  });

  it('should extract label from object', () => {
    const value = { label: 'Label Text' };
    expect(pipe.transform(value)).toBe('Label Text');
  });

  it('should extract title from object', () => {
    const value = { title: 'Title Text' };
    expect(pipe.transform(value)).toBe('Title Text');
  });
});
