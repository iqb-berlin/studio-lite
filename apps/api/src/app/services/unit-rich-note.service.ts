import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UnitRichNoteDto,
  CreateUnitRichNoteDto,
  UpdateUnitRichNoteDto,
  UnitRichNotesDto,
  UnitRichNoteLinkDto,
  UnitRichNoteTagDto,
  WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
import UnitRichNote from '../entities/unit-rich-note.entity';
import Unit from '../entities/unit.entity';
import Workspace from '../entities/workspace.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { ItemRichNoteService } from './item-rich-note.service';
import { UnitService } from './unit.service';
import { SettingService } from './setting.service';
import { ItemUuidLookup } from '../interfaces/item-uuid-lookup.interface';

@Injectable()
export class UnitRichNoteService {
  private readonly logger = new Logger(UnitRichNoteService.name);

  constructor(
    @InjectRepository(UnitRichNote)
    private unitRichNotesRepository: Repository<UnitRichNote>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupRepository: Repository<WorkspaceGroup>,
    private itemRichNoteService: ItemRichNoteService,
    private unitService: UnitService,
    private settingService: SettingService
  ) {}

  async findNotes(unitId: number): Promise<UnitRichNotesDto> {
    this.logger.log(`Returning rich notes for unit with id: ${unitId}`);
    let tags: UnitRichNoteTagDto[] = [];

    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      select: ['workspaceId']
    });

    if (unit) {
      const workspace = await this.workspaceRepository.findOne({
        where: { id: unit.workspaceId },
        select: ['groupId']
      });

      if (workspace) {
        const workspaceGroup = await this.workspaceGroupRepository.findOne({
          where: { id: workspace.groupId },
          select: ['settings']
        });

        if (workspaceGroup?.settings && (workspaceGroup.settings as WorkspaceGroupSettingsDto).richNoteTags) {
          tags = (workspaceGroup.settings as WorkspaceGroupSettingsDto).richNoteTags;
        }
      }
    }

    if (tags.length === 0) {
      tags = await this.settingService.findUnitRichNoteTags();
    }

    const notes = await this.unitRichNotesRepository
      .find({
        where: { unitId: unitId },
        order: { createdAt: 'ASC' }
      });

    const enrichedNotes = await Promise.all(notes.map(async note => {
      const itemReferences = (await this.itemRichNoteService.findUnitItemNotes(unitId, note.id))
        .map(i => i.unitItemUuid);
      return {
        id: note.id,
        unitId: note.unitId,
        tagId: note.tagId,
        content: note.content,
        links: note.links,
        createdAt: note.createdAt,
        changedAt: note.changedAt,
        itemReferences
      };
    }));

    return { tags, notes: enrichedNotes };
  }

  async importNotes(
    notes: Record<string, unknown>[],
    unitId: number,
    itemUuidLookups: ItemUuidLookup[]
  ): Promise<void> {
    await Promise.all(notes.map(async note => {
      const { tagLabel, ...noteData } = note;

      const newItemReferences: string[] = [];
      const itemReferences = noteData.itemReferences as string[] | undefined;
      if (itemReferences && itemReferences.length) {
        itemReferences.forEach((oldItemUuid: string) => {
          const match = itemUuidLookups.find(lookup => lookup.oldUuid === oldItemUuid);
          if (match) {
            newItemReferences.push(match.newUuid);
          }
        });
      }

      await this.createNote({
        unitId,
        tagId: noteData.tagId as string,
        content: noteData.content as string,
        links: noteData.links as unknown as UnitRichNoteLinkDto[],
        itemReferences: newItemReferences
      });
    }));
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

      if (note.itemReferences !== undefined) {
        await this.itemRichNoteService.updateNoteItems(noteToUpdate.unitId, id, note.itemReferences);
      }
    } else {
      throw new NotFoundException(`Rich note with id ${id} not found`);
    }
  }
}
