import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUnitUserDto } from '@studio-lite-lib/api-dto';
import UnitUser from '../entities/unit-user.entity';
import Unit from '../entities/unit.entity';

@Injectable()
export class UnitUserService {
  private readonly logger = new Logger(UnitUserService.name);

  constructor(
    @InjectRepository(UnitUser)
    private unitUserRepository: Repository<UnitUser>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>
  ) {}

  async createUnitUser(userId: number, unitId: number): Promise<void> {
    this.logger.log(`Creating UnitUser with userId ${userId} & unitId ${unitId}`);
    const unitUser = await this.unitUserRepository.create(<UnitUser>{
      userId: userId,
      unitId: unitId,
      lastSeenCommentChangedAt: new Date(2022, 6)
    });
    await this.unitUserRepository.save(unitUser);
  }

  async findLastSeenCommentTimestamp(userId: number, unitId: number): Promise<Date> {
    const unitUser = await this.unitUserRepository.findOne({
      where: {
        userId: userId,
        unitId: unitId
      }
    });
    return unitUser ? unitUser.lastSeenCommentChangedAt : new Date(2022, 6);
  }

  async patchUnitUserCommentsLastSeen(
    unitId: number,
    updateUnitUser: UpdateUnitUserDto
  ): Promise<void> {
    this.logger.log('Update lastSeenCommentChangedAt of UnitUser');
    const unitUser = await this.unitUserRepository
      .findOne({ where: { userId: updateUnitUser.userId, unitId: unitId } });
    if (unitUser) {
      unitUser.lastSeenCommentChangedAt = updateUnitUser.lastSeenCommentChangedAt;
      await this.unitUserRepository.save(unitUser);
    }
  }

  async deleteUnitUsersByWorkspaceId(workspaceId: number, userId: number) {
    const units = await this.unitRepository.find({ where: { workspaceId: workspaceId } });
    await Promise.all(units.map(async unit => {
      const existingUnitUser = await this.unitUserRepository.findOne({
        where: {
          userId: userId,
          unitId: unit.id
        }
      });
      if (existingUnitUser) {
        await this.unitUserRepository.delete(existingUnitUser);
      }
    }));
  }

  async findByUnitId(unitId: number): Promise<UnitUser[]> {
    return this.unitUserRepository.find({ where: { unitId: unitId } });
  }
}
