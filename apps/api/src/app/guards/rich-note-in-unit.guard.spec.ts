import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RichNoteInUnitGuard } from './rich-note-in-unit.guard';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { UnitRichNoteNotFoundException } from '../exceptions/unit-rich-note-not-found.exception';

describe('RichNoteInUnitGuard', () => {
  let guard: RichNoteInUnitGuard;
  let unitRichNoteService: DeepMocked<UnitRichNoteService>;

  const contextFor = (params: Record<string, string>, method = 'PATCH'): ExecutionContext => createMock<
    ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 1 }, params, method })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitRichNoteService,
          useValue: createMock<UnitRichNoteService>()
        },
        RichNoteInUnitGuard
      ]
    }).compile();

    guard = module.get<RichNoteInUnitGuard>(RichNoteInUnitGuard);
    unitRichNoteService = module.get(UnitRichNoteService);
    unitRichNoteService.isInUnit.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should pass when the note in the route belongs to the unit in the route', async () => {
    expect(await guard.canActivate(contextFor({ id: '7', unit_id: '10' }))).toBe(true);
    expect(unitRichNoteService.isInUnit).toHaveBeenCalledWith(7, 10);
  });

  it('should read the note from note_id as well', async () => {
    expect(await guard.canActivate(contextFor({ note_id: '7', unit_id: '10' }))).toBe(true);
    expect(unitRichNoteService.isInUnit).toHaveBeenCalledWith(7, 10);
  });

  it('should throw UnitRichNoteNotFoundException for a note of another unit or none at all', async () => {
    unitRichNoteService.isInUnit.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ id: '7', unit_id: '11' })))
      .rejects.toThrow(UnitRichNoteNotFoundException);
  });

  it('should name the note and the method of the request in the exception', async () => {
    unitRichNoteService.isInUnit.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ id: '7', unit_id: '11' }, 'DELETE')))
      .rejects.toMatchObject({ response: { id: 7, method: 'DELETE' } });
  });

  it.each([
    [{ id: 'abc', unit_id: '10' }],
    [{ id: '7.5', unit_id: '10' }],
    [{ unit_id: '10' }],
    [{ id: '7', unit_id: 'abc' }],
    [{ id: '7' }]
  ])('should throw UnitRichNoteNotFoundException for %p without looking the note up', async params => {
    await expect(guard.canActivate(contextFor(params)))
      .rejects.toThrow(UnitRichNoteNotFoundException);
    expect(unitRichNoteService.isInUnit).not.toHaveBeenCalled();
  });
});
