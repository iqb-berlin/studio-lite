import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ItemInUnitGuard } from './item-in-unit.guard';
import { UnitItemService } from '../services/unit-item.service';
import { UnitItemNotFoundException } from '../exceptions/unit-item-not-found.exception';

describe('ItemInUnitGuard', () => {
  let guard: ItemInUnitGuard;
  let unitItemService: DeepMocked<UnitItemService>;

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
          provide: UnitItemService,
          useValue: createMock<UnitItemService>()
        },
        ItemInUnitGuard
      ]
    }).compile();

    guard = module.get<ItemInUnitGuard>(ItemInUnitGuard);
    unitItemService = module.get(UnitItemService);
    unitItemService.isInUnit.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should pass when the item in the route is one of the unit in the route', async () => {
    expect(await guard.canActivate(contextFor({ uuid, unit_id: '10' }))).toBe(true);
    expect(unitItemService.isInUnit).toHaveBeenCalledWith(uuid, 10);
  });

  it('should read the item from item_uuid as well', async () => {
    expect(await guard.canActivate(contextFor({ item_uuid: uuid, unit_id: '10' }))).toBe(true);
    expect(unitItemService.isInUnit).toHaveBeenCalledWith(uuid, 10);
  });

  it('should throw UnitItemNotFoundException for an item of another unit or none at all', async () => {
    unitItemService.isInUnit.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ uuid, unit_id: '11' })))
      .rejects.toThrow(UnitItemNotFoundException);
  });

  it('should name the item and the method of the request in the exception', async () => {
    unitItemService.isInUnit.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ item_uuid: uuid, unit_id: '11' }, 'GET')))
      .rejects.toMatchObject({ response: { uuid, controller: 'unit-item', method: 'GET' } });
  });

  it.each([
    [{ uuid: 'no-item', unit_id: '10' }],
    [{ unit_id: '10' }],
    [{ uuid, unit_id: 'abc' }],
    [{ uuid }]
  ])('should throw UnitItemNotFoundException for %p without looking the item up', async params => {
    await expect(guard.canActivate(contextFor(params)))
      .rejects.toThrow(UnitItemNotFoundException);
    expect(unitItemService.isInUnit).not.toHaveBeenCalled();
  });
});
