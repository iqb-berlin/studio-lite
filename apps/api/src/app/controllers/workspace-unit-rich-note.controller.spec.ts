import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceUnitRichNoteController } from './workspace-unit-rich-note.controller';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { ItemRichNoteService } from '../services/item-rich-note.service';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('WorkspaceUnitRichNoteController', () => {
  let controller: WorkspaceUnitRichNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitRichNoteController],
      providers: [
        { provide: UnitRichNoteService, useValue: createMock<UnitRichNoteService>() },
        { provide: ItemRichNoteService, useValue: createMock<ItemRichNoteService>() },
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        { provide: WorkspaceUserService, useValue: createMock<WorkspaceUserService>() }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitRichNoteController>(WorkspaceUnitRichNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
