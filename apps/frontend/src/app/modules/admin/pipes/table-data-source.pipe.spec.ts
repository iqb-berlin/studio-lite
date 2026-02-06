import { MatTableDataSource } from '@angular/material/table';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { TableDataSourcePipe } from './table-data-source.pipe';

describe('TableDataSourcePipe', () => {
  let pipe: TableDataSourcePipe;

  beforeEach(() => {
    pipe = new TableDataSourcePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
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

  it('should handle empty array', () => {
    const emptyArray: ResourcePackageDto[] = [];
    const result = pipe.transform(emptyArray);

    expect(result).toBeInstanceOf(MatTableDataSource);
    expect(result.data).toEqual([]);
    expect(result.data.length).toBe(0);
  });

  it('should create a new MatTableDataSource instance each time', () => {
    const mockData: ResourcePackageDto[] = [
      {
        id: 1,
        name: 'Package 1',
        elements: ['file1.png'],
        createdAt: new Date('2024-01-01')
      }
    ];

    const result1 = pipe.transform(mockData);
    const result2 = pipe.transform(mockData);

    expect(result1).toBeInstanceOf(MatTableDataSource);
    expect(result2).toBeInstanceOf(MatTableDataSource);
    expect(result1).not.toBe(result2);
  });

  it('should handle resource packages without optional createdAt', () => {
    const mockData: ResourcePackageDto[] = [
      {
        id: 1,
        name: 'Package Without Date',
        elements: ['file1.png']
      }
    ];

    const result = pipe.transform(mockData);

    expect(result).toBeInstanceOf(MatTableDataSource);
    expect(result.data).toEqual(mockData);
    expect(result.data[0].createdAt).toBeUndefined();
  });

  it('should handle large datasets', () => {
    const largeDataset: ResourcePackageDto[] = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `Package ${i + 1}`,
      elements: [`file${i}.png`],
      createdAt: new Date()
    }));

    const result = pipe.transform(largeDataset);

    expect(result).toBeInstanceOf(MatTableDataSource);
    expect(result.data.length).toBe(1000);
    expect(result.data).toEqual(largeDataset);
  });
});
