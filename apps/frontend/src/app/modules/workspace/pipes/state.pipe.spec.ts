import { StatePipe } from './state.pipe';
import { State } from '../../admin/models/state.type';

describe('StatePipe', () => {
  let pipe: StatePipe;

  beforeEach(() => {
    pipe = new StatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
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

  it('should return label for first matching state', () => {
    const states: State[] = [
      { id: 1, label: 'First', color: '#111111' },
      { id: 2, label: 'Second', color: '#222222' }
    ];

    expect(pipe.transform('1', 'label', states)).toBe('First');
  });

  it('should return color for last state', () => {
    const states: State[] = [
      { id: 1, label: 'State1', color: '#111111' },
      { id: 2, label: 'State2', color: '#222222' },
      { id: 3, label: 'State3', color: '#333333' }
    ];

    expect(pipe.transform('3', 'color', states)).toBe('#333333');
  });

  it('should handle state with id 0', () => {
    const states: State[] = [
      { id: 0, label: 'Initial', color: '#000000' },
      { id: 1, label: 'Active', color: '#ffffff' }
    ];

    expect(pipe.transform('0', 'label', states)).toBe('Initial');
  });

  it('should handle multiple states with different properties', () => {
    const states: State[] = [
      { id: 10, label: 'Todo', color: '#edb211' },
      { id: 20, label: 'Doing', color: '#2196f3' },
      { id: 30, label: 'Done', color: '#4caf50' }
    ];

    expect(pipe.transform('20', 'label', states)).toBe('Doing');
    expect(pipe.transform('20', 'color', states)).toBe('#2196f3');
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
