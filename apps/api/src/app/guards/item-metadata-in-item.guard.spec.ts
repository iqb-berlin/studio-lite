import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ItemMetadataInItemGuard } from './item-metadata-in-item.guard';
import { UnitItemMetadataService } from '../services/unit-item-metadata.service';
import { UnitItemMetadataNotFoundException } from '../exceptions/unit-item-metadata-not-found.exception';

describe('ItemMetadataInItemGuard', () => {
  let guard: ItemMetadataInItemGuard;
  let unitItemMetadataService: DeepMocked<UnitItemMetadataService>;

  const uuid = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

  const contextFor = (params: Record<string, string>, method = 'DELETE'): ExecutionContext => createMock<
    ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 1 }, params, method })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitItemMetadataService,
          useValue: createMock<UnitItemMetadataService>()
        },
        ItemMetadataInItemGuard
      ]
    }).compile();

    guard = module.get<ItemMetadataInItemGuard>(ItemMetadataInItemGuard);
    unitItemMetadataService = module.get(UnitItemMetadataService);
    unitItemMetadataService.isOfItem.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should pass when the row in the route is one of the item in the route', async () => {
    expect(await guard.canActivate(contextFor({ id: '5', item_uuid: uuid, unit_id: '10' }))).toBe(true);
    expect(unitItemMetadataService.isOfItem).toHaveBeenCalledWith(5, uuid);
  });

  it('should throw UnitItemMetadataNotFoundException for a row of another item or none at all', async () => {
    unitItemMetadataService.isOfItem.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ id: '5', item_uuid: uuid, unit_id: '10' })))
      .rejects.toThrow(UnitItemMetadataNotFoundException);
  });

  it('should name the row and the method of the request in the exception', async () => {
    unitItemMetadataService.isOfItem.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ id: '5', item_uuid: uuid }, 'DELETE')))
      .rejects.toMatchObject({ response: { id: 5, method: 'DELETE' } });
  });

  it.each([
    [{ id: 'abc', item_uuid: uuid }],
    [{ item_uuid: uuid }],
    [{ id: '5', item_uuid: 'no-item' }],
    [{ id: '5' }]
  ])('should throw UnitItemMetadataNotFoundException for %p without looking the row up', async params => {
    await expect(guard.canActivate(contextFor(params)))
      .rejects.toThrow(UnitItemMetadataNotFoundException);
    expect(unitItemMetadataService.isOfItem).not.toHaveBeenCalled();
  });
});
