import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { GetItemLabelPipe } from './get-item-label.pipe';

describe('GetItemLabelPipe', () => {
  const pipe = new GetItemLabelPipe();
  const items: UnitItemDto[] = [
    { uuid: 'u1', id: 'item1' },
    { uuid: 'u2' }
  ];

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return item id for given uuid', () => {
    expect(pipe.transform('u1', items)).toBe('item1');
  });

  it('should return uuid if item has no id', () => {
    expect(pipe.transform('u2', items)).toBe('u2');
  });

  it('should return uuid if item not found', () => {
    expect(pipe.transform('u3', items)).toBe('u3');
  });

  it('should return uuid if items list is empty', () => {
    expect(pipe.transform('u1', [])).toBe('u1');
  });
});
