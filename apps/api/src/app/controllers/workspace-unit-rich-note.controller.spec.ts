import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceUnitRichNoteController } from './workspace-unit-rich-note.controller';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { ItemRichNoteService } from '../services/item-rich-note.service';

describe('WorkspaceUnitRichNoteController', () => {
  let controller: WorkspaceUnitRichNoteController;

  const mockUnitRichNoteService = {
    findNotes: jest.fn(),
    createNote: jest.fn(),
    patchNote: jest.fn(),
    removeNote: jest.fn()
  };

  const mockItemRichNoteService = {
    updateNoteItems: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitRichNoteController],
      providers: [
        { provide: UnitRichNoteService, useValue: mockUnitRichNoteService },
        { provide: ItemRichNoteService, useValue: mockItemRichNoteService }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitRichNoteController>(WorkspaceUnitRichNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
