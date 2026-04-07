import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitRichNoteUnitItem from '../entities/unit-rich-note-unit-item.entity';
import UnitRichNote from '../entities/unit-rich-note.entity';
import UnitItem from '../entities/unit-item.entity';
import { UnitItemNotFoundException } from '../exceptions/unit-item-not-found.exception';

@Injectable()
export class ItemRichNoteService {
  private readonly logger = new Logger(ItemRichNoteService.name);

  constructor(
    @InjectRepository(UnitRichNoteUnitItem)
    private unitRichNoteUnitItemRepository: Repository<UnitRichNoteUnitItem>,
    @InjectRepository(UnitRichNote)
    private unitRichNotesRepository: Repository<UnitRichNote>,
    @InjectRepository(UnitItem)
    private unitItemRepository: Repository<UnitItem>
  ) {}

  async findItemNotes(itemUuid: string): Promise<UnitRichNoteUnitItem[]> {
    this.logger.log(`Returning notes for item with uuid: ${itemUuid}`);
    return this.unitRichNoteUnitItemRepository
      .find({
        where: { unitItemUuid: itemUuid },
        order: { createdAt: 'ASC' }
      });
  }

  async findNoteItems(noteId: number): Promise<UnitRichNoteUnitItem[]> {
    this.logger.log(`Returning items for note with id: ${noteId}`);
    return this.unitRichNoteUnitItemRepository
      .find({
        where: { unitRichNoteId: noteId },
        order: { createdAt: 'ASC' }
      });
  }

  async createNoteItemConnection(unitId: number, itemUuid: string, noteId: number): Promise<number> {
    this.logger.log(`Creating a note connection for item with uuid ${itemUuid}`);

    const note = await this.unitRichNotesRepository.findOne({
      where: { id: noteId }
    });
    if (!note) {
      this.logger.warn(`Note with id ${noteId} not found`);
      throw new NotFoundException(`Note with id ${noteId} not found`);
    }

    const item = await this.unitItemRepository.findOne({
      where: { uuid: itemUuid }
    });
    if (!item) {
      this.logger.warn(`Unit item with uuid ${itemUuid} not found`);
      throw new UnitItemNotFoundException(itemUuid, 'createNoteItemConnection');
    }

    const existingConnection = await this.unitRichNoteUnitItemRepository.findOne({
      where: {
        unitRichNoteId: noteId,
        unitItemUuid: itemUuid
      }
    });

    if (existingConnection) {
      this.logger.log(`Connection already exists for item ${itemUuid} and note ${noteId}`);
      return noteId;
    }

    const timeStamp = new Date();
    const unitRichNoteUnitItem = this.unitRichNoteUnitItemRepository
      .create({
        unitRichNoteId: noteId,
        unitItemUuid: itemUuid,
        unitId: unitId,
        createdAt: timeStamp,
        changedAt: timeStamp
      });

    await this.unitRichNoteUnitItemRepository.save(unitRichNoteUnitItem);
    this.logger.log(`Successfully created connection for item ${itemUuid} and note ${noteId}`);
    return noteId;
  }

  async removeNoteItemConnection(itemUuid: string, noteId: number): Promise<void> {
    this.logger.log(`Deleting note connection for item with uuid: ${itemUuid}`);
    await this.unitRichNoteUnitItemRepository.delete({
      unitRichNoteId: noteId,
      unitItemUuid: itemUuid
    });
  }

  findUnitItemNotes(unitId: number, noteId: number): Promise<UnitRichNoteUnitItem[]> {
    this.logger.log(`Returning item notes for unit with id: ${unitId}`);
    return this.unitRichNoteUnitItemRepository
      .find({
        where: { unitId: unitId, unitRichNoteId: noteId },
        order: { createdAt: 'ASC' },
        select: ['unitItemUuid']
      });
  }

  async updateNoteItems(unitId: number, noteId: number, itemReferences: string[]) {
    try {
      const noteItems = await this.findNoteItems(noteId);
      const { removed, added } = ItemRichNoteService.compare(noteItems, itemReferences);

      await Promise.all(removed.map(async unitItemUuid => {
        try {
          await this.removeNoteItemConnection(unitItemUuid, noteId);
        } catch (error) {
          this.logger.error(`Failed to remove connection for item ${unitItemUuid}: ${error.message}`);
        }
      }));

      await Promise.all(added.map(async unitItemUuid => {
        try {
          await this.createNoteItemConnection(unitId, unitItemUuid, noteId);
        } catch (error) {
          this.logger.error(`Failed to create connection for item ${unitItemUuid}: ${error.message}`);
        }
      }));
    } catch (error) {
      this.logger.error(`Error in updateNoteItems: ${error.message}`);
      throw error;
    }
  }

  static compare(
    savedItems: UnitRichNoteUnitItem[],
    itemReferences: string[]
  ): { unchanged: string[]; removed: string[]; added: string[]; } {
    const savedUuids = savedItems.map(i => i.unitItemUuid);
    const unchanged = savedUuids.filter(uuid => itemReferences.includes(uuid));
    const removed = savedUuids.filter(uuid => !itemReferences.includes(uuid));
    const added = itemReferences.filter(uuid => !savedUuids.includes(uuid));
    return { unchanged, removed, added };
  }
}
