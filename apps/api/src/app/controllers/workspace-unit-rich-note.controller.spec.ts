import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateUnitRichNoteDto } from '@studio-lite-lib/api-dto';
import { WorkspaceUnitRichNoteController } from './workspace-unit-rich-note.controller';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { ItemRichNoteService } from '../services/item-rich-note.service';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { UnitService } from '../services/unit.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { UnitInWorkspaceGuard } from '../guards/unit-in-workspace.guard';
import { WriteOrGroupAdminAccessGuard } from '../guards/write-or-group-admin-access.guard';
import { RichNoteInUnitGuard } from '../guards/rich-note-in-unit.guard';

describe('WorkspaceUnitRichNoteController', () => {
  let controller: WorkspaceUnitRichNoteController;
  let unitRichNoteService: DeepMocked<UnitRichNoteService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitRichNoteController],
      providers: [
        { provide: UnitRichNoteService, useValue: createMock<UnitRichNoteService>() },
        { provide: ItemRichNoteService, useValue: createMock<ItemRichNoteService>() },
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        { provide: WorkspaceUserService, useValue: createMock<WorkspaceUserService>() },
        { provide: UnitService, useValue: createMock<UnitService>() }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitRichNoteController>(WorkspaceUnitRichNoteController);
    unitRichNoteService = module.get(UnitRichNoteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // The access guards ask about the workspace in the path alone (#1775).
  it.each(['findNotes', 'createNote', 'patchNote', 'patchNoteItems', 'removeNote'] as const)(
    'should hold the unit of %s to the workspace in its path',
    method => {
      expect(Reflect.getMetadata('__guards__', WorkspaceUnitRichNoteController.prototype[method]).slice(0, 3))
        .toEqual([JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard]);
    }
  );

  // The note of the path is held to the unit last, after the access is known (#1778).
  it.each(['patchNote', 'patchNoteItems', 'removeNote'] as const)(
    'should hold the note of %s to the unit in its path',
    method => {
      expect(Reflect.getMetadata('__guards__', WorkspaceUnitRichNoteController.prototype[method])).toEqual([
        JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WriteOrGroupAdminAccessGuard, RichNoteInUnitGuard
      ]);
    }
  );

  it('should create the note on the unit of the path, whatever the body names', async () => {
    const dto: CreateUnitRichNoteDto = { unitId: 99, tagId: 'tag', content: 'note' };
    unitRichNoteService.createNote.mockResolvedValue(1);

    expect(await controller.createNote(10, dto)).toBe(1);
    expect(unitRichNoteService.createNote).toHaveBeenCalledWith({ ...dto, unitId: 10 });
  });
});
