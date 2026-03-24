import { TestBed } from '@angular/core/testing';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { MapItemUuidsIdsPipe } from './map-item-uuids-ids.pipe';

describe('MapItemUuidsIdsPipe', () => {
  let pipe: MapItemUuidsIdsPipe;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
    translateService = TestBed.inject(TranslateService);
    pipe = new MapItemUuidsIdsPipe(translateService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should map uuids to ids using unitItems', () => {
    const unitItems: UnitItemDto[] = [
      { uuid: 'uuid1', id: 'ID 1' } as UnitItemDto,
      { uuid: 'uuid2', id: 'ID 2' } as UnitItemDto
    ];
    const uuids = ['uuid1', 'uuid2'];
    const result = pipe.transform(uuids, unitItems);
    expect(result).toEqual([
      { uuid: 'uuid1', id: 'ID 1' },
      { uuid: 'uuid2', id: 'ID 2' }
    ]);
  });

  it('should use fallback translation if uuid is not found in unitItems', () => {
    const unitItems: UnitItemDto[] = [
      { uuid: 'uuid1', id: 'ID 1' } as UnitItemDto
    ];
    const uuids = ['uuid1', 'uuid2'];
    jest.spyOn(translateService, 'instant').mockReturnValue('ohne Titel');

    const result = pipe.transform(uuids, unitItems);
    expect(result).toEqual([
      { uuid: 'uuid1', id: 'ID 1' },
      { uuid: 'uuid2', id: 'ohne Titel' }
    ]);
    expect(translateService.instant).toHaveBeenCalledWith('metadata.without-id');
  });

  it('should handle empty or null unitItems', () => {
    const uuids = ['uuid1'];
    jest.spyOn(translateService, 'instant').mockReturnValue('ohne Titel');

    const result = pipe.transform(uuids, []);
    expect(result).toEqual([{ uuid: 'uuid1', id: 'ohne Titel' }]);
  });
});
