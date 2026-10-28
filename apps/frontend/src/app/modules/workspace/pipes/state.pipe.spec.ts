import { State } from '@studio-lite-lib/api-dto';
import { StatePipe } from './state.pipe';

describe('StatePipe', () => {
  let pipe: StatePipe;

  beforeEach(() => {
    pipe = new StatePipe();
  });

  it('should return label for matching state id', () => {
    const states: State[] = [
      { id: 1, label: 'Draft', color: '#ff0000' },
      { id: 2, label: 'Review', color: '#00ff00' },
      { id: 3, label: 'Final', color: '#0000ff' }
    ];

    expect(pipe.transform('2', 'label', states)).toBe('Review');
  });

  it('should return color for matching state id', () => {
    const states: State[] = [
      { id: 1, label: 'Draft', color: '#ff0000' },
      { id: 2, label: 'Review', color: '#00ff00' },
      { id: 3, label: 'Final', color: '#0000ff' }
    ];

    expect(pipe.transform('1', 'color', states)).toBe('#ff0000');
  });

  it('should return empty string when state id is not found', () => {
    const states: State[] = [
      { id: 1, label: 'Draft', color: '#ff0000' },
      { id: 2, label: 'Review', color: '#00ff00' }
    ];

    expect(pipe.transform('999', 'label', states)).toBe('');
  });

  it('should return empty string when states array is empty', () => {
    const states: State[] = [];

    expect(pipe.transform('1', 'label', states)).toBe('');
  });

  it('should handle string id that converts to number', () => {
    const states: State[] = [
      { id: 42, label: 'In Progress', color: '#ffaa00' }
    ];

    expect(pipe.transform('42', 'label', states)).toBe('In Progress');
  });

  it('should handle state with id 0', () => {
    const states: State[] = [
      { id: 0, label: 'Initial', color: '#000000' },
      { id: 1, label: 'Active', color: '#ffffff' }
    ];

    expect(pipe.transform('0', 'label', states)).toBe('Initial');
  });

  it('should return empty string when id is not a valid number string', () => {
    const states: State[] = [
      { id: 1, label: 'State', color: '#123456' }
    ];

    expect(pipe.transform('invalid', 'label', states)).toBe('');
  });

  it('should handle negative state ids', () => {
    const states: State[] = [
      { id: -1, label: 'Negative', color: '#aaaaaa' }
    ];

    expect(pipe.transform('-1', 'label', states)).toBe('Negative');
  });
});
