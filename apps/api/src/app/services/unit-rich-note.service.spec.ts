import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnitRichNoteService } from './unit-rich-note.service';
import UnitRichNote from '../entities/unit-rich-note.entity';
import { ItemRichNoteService } from './item-rich-note.service';
import { SettingService } from './setting.service';

describe('UnitRichNoteService', () => {
  let service: UnitRichNoteService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn()
  };

  const mockItemRichNoteService = {
    findUnitItemNotes: jest.fn(),
    findNoteItems: jest.fn(),
    updateNoteItems: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitRichNoteService,
        { provide: getRepositoryToken(UnitRichNote), useValue: mockRepository },
        { provide: ItemRichNoteService, useValue: mockItemRichNoteService },
        { provide: SettingService, useValue: { findUnitRichNoteTags: jest.fn().mockReturnValue(of([])) } }
      ]
    }).compile();

    service = module.get<UnitRichNoteService>(UnitRichNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
