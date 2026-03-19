import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UnitRichNoteDto, CreateUnitRichNoteDto, UpdateUnitRichNoteDto, UnitRichNotesDto
} from '@studio-lite-lib/api-dto';
import UnitRichNote from '../entities/unit-rich-note.entity';
import { ItemRichNoteService } from './item-rich-note.service';
import { WorkspaceService } from './workspace.service';
import { UnitService } from './unit.service';

@Injectable()
export class UnitRichNoteService {
  private readonly logger = new Logger(UnitRichNoteService.name);

  constructor(
    @InjectRepository(UnitRichNote)
    private unitRichNotesRepository: Repository<UnitRichNote>,
    private itemRichNoteService: ItemRichNoteService,
    private workspaceService: WorkspaceService,
    private unitService: UnitService
  ) {}

  async findNotes(unitId: number): Promise<UnitRichNotesDto> {
    this.logger.log(`Returning rich notes for unit with id: ${unitId}`);
    const unit = await this.unitService.findOne(unitId);
    const workspace = await this.workspaceService.findOne(unit.workspaceId);
    const tags = workspace.settings?.richNoteTags || [];

    const notes = await this.unitRichNotesRepository
      .find({
        where: { unitId: unitId },
        order: { createdAt: 'ASC' }
      });

    const enrichedNotes = await Promise.all(notes.map(async note => ({
      ...note,
      itemReferences: (await this.itemRichNoteService.findUnitItemNotes(unitId, note.id))
        .map(i => i.unitItemUuid)
    })));

    return { tags, notes: enrichedNotes };
  }

  async createNote(unitRichNote: CreateUnitRichNoteDto): Promise<number> {
    this.logger.log(`Creating a rich note for unit with id: ${unitRichNote.unitId}`);
    const timeStamp = new Date();
    const newNote = this.unitRichNotesRepository
      .create({
        unitId: unitRichNote.unitId,
        tagId: unitRichNote.tagId,
        content: unitRichNote.content,
        links: unitRichNote.links,
        createdAt: timeStamp,
        changedAt: timeStamp
      });
    await this.unitRichNotesRepository.save(newNote);

    if (unitRichNote.itemReferences && unitRichNote.itemReferences.length) {
      await this.itemRichNoteService.updateNoteItems(unitRichNote.unitId, newNote.id, unitRichNote.itemReferences);
    }

    return newNote.id;
  }

  async removeNote(id: number): Promise<void> {
    this.logger.log(`Deleting rich note with id: ${id}`);
    await this.unitRichNotesRepository.delete(id);
  }

  async findOneNote(id: number): Promise<UnitRichNoteDto> {
    this.logger.log(`Accessing rich note with id: ${id}`);
    const note = await this.unitRichNotesRepository.findOne({ where: { id: id } });
    if (note) {
      const itemReferences = (await this.itemRichNoteService.findNoteItems(id)).map(i => i.unitItemUuid);
      return { ...note, itemReferences };
    }
    throw new NotFoundException(`Rich note with id ${id} not found`);
  }

  async patchNote(id: number, note: UpdateUnitRichNoteDto): Promise<void> {
    this.logger.log(`Updating rich note with id: ${id}`);
    const noteToUpdate = await this.unitRichNotesRepository.findOne({ where: { id: id } });
    if (noteToUpdate) {
      if (note.tagId !== undefined) noteToUpdate.tagId = note.tagId;
      if (note.content !== undefined) noteToUpdate.content = note.content;
      if (note.links !== undefined) noteToUpdate.links = note.links;
      noteToUpdate.changedAt = new Date();
      await this.unitRichNotesRepository.save(noteToUpdate);
    } else {
      throw new NotFoundException(`Rich note with id ${id} not found`);
    }
  }
}
