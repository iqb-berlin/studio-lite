import { MatTableDataSource } from '@angular/material/table';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { TableDataSourcePipe } from './table-data-source.pipe';

describe('TableDataSourcePipe', () => {
  let pipe: TableDataSourcePipe;

  beforeEach(() => {
    pipe = new TableDataSourcePipe();
  });

  it('should transform an array of ResourcePackageDto to MatTableDataSource', () => {
    const mockData: ResourcePackageDto[] = [
      {
        id: 1,
        name: 'Package 1',
        elements: ['file1.png', 'file2.jpg'],
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        name: 'Package 2',
        elements: ['file3.svg'],
        createdAt: new Date('2024-01-02')
      }
    ];

    const result = pipe.transform(mockData);

    expect(result).toBeInstanceOf(MatTableDataSource);
    expect(result.data).toEqual(mockData);
    expect(result.data.length).toBe(2);
  });

  it('should return empty MatTableDataSource when input is null', () => {
    const result = pipe.transform(null);

    expect(result).toBeInstanceOf(MatTableDataSource);
    expect(result.data).toEqual([]);
    expect(result.data.length).toBe(0);
  });
});
