import { Injectable, Logger } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  MyDataDto,
  UserFullDto,
  UserInListDto,
  UsersInWorkspaceDto,
  UserWorkspaceAccessDto,
  WorkspaceUserInListDto
} from '@studio-lite-lib/api-dto';
import User from '../entities/user.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import { AdminUserNotFoundException } from '../exceptions/admin-user-not-found.exception';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import Workspace from '../entities/workspace.entity';
import Review from '../entities/review.entity';
import { UnitService } from './unit.service';
import { UnitUserService } from './unit-user.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>,
    @InjectRepository(WorkspaceGroupAdmin)
    private workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private unitService: UnitService,
    private unitUserService: UnitUserService
  ) {
  }

  async findAllUsers(workspaceId?: number): Promise<WorkspaceUserInListDto[]> {
    // TODO: sollte Fehler liefern wenn eine nicht gültige workspaceId verwendet wird
    this.logger.log(`Returning users${workspaceId ? ` for workspaceId: ${workspaceId}` : '.'}`);
    const validUsers: UserWorkspaceAccessDto[] = [];
    if (workspaceId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository
        .find({ where: { workspaceId: workspaceId } });
      workspaceUsers.forEach(wsU => validUsers.push(
        { id: wsU.userId, accessLevel: wsU.accessLevel }
      ));
    }
    const users: User[] = await this.usersRepository
      .find({ order: { name: 'ASC' } });
    const returnUsers: WorkspaceUserInListDto[] = [];
    users.forEach(user => {
      if (!workspaceId || (validUsers
        .find(validUser => validUser.id === user.id))) {
        returnUsers.push(<WorkspaceUserInListDto>{
          id: user.id,
          name: user.name,
          workspaceAccessLevel: validUsers
            .find(validUser => validUser.id === user.id)?.accessLevel || 0,
          isAdmin: user.isAdmin,
          description: user.description,
          displayName: UnitService.getUserDisplayName(user),
          email: `${user.email}${user.emailPublishApproved ? '' : ' (verborgen)'}`
        });
      }
    });
    return returnUsers;
  }

  async findAllWorkspaceGroupAdmins(workspaceGroupId: number): Promise<UserInListDto[]> {
    const workspaceGroupAdmins = await this.workspaceGroupAdminRepository.find({
      where: { workspaceGroupId: workspaceGroupId },
      select: { userId: true }
    });
    const workspaceGroupAdminsIds = workspaceGroupAdmins.map(wsgA => wsgA.userId);
    const users: User[] = await this.usersRepository.find({ order: { name: 'ASC' } });
    const returnUsers: UserInListDto[] = [];
    users.forEach(user => {
      if (workspaceGroupAdminsIds.indexOf(user.id) > -1) {
        returnUsers.push(<UserInListDto>{
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          description: user.description,
          displayName: UnitService.getUserDisplayName(user),
          email: user.emailPublishApproved ? user.email : ''
        });
      }
    });
    return returnUsers;
  }

  async findAllWorkspaceUsers(workspaceId: number): Promise<UsersInWorkspaceDto> {
    const returnUsers: UsersInWorkspaceDto = {
      users: [],
      workspaceGroupAdmins: [],
      admins: []
    };
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { groupId: true }
    });
    const workspaceGroupAdmins: number[] = [];
    await this.workspaceGroupAdminRepository.find({
      where: { workspaceGroupId: workspace.groupId },
      select: { userId: true }
    }).then(adminsData => {
      adminsData.forEach(adminData => {
        workspaceGroupAdmins.push(adminData.userId);
      });
    });
    const users: number[] = [];
    await this.workspaceUsersRepository.find({
      where: { workspaceId: workspaceId },
      select: { userId: true }
    }).then(usersData => {
      usersData.forEach(userData => {
        users.push(userData.userId);
      });
    });
    await this.usersRepository.find({
      select: {
        id: true,
        email: true,
        emailPublishApproved: true,
        firstName: true,
        lastName: true,
        name: true,
        isAdmin: true,
        description: true
      }
    }).then(allUsers => {
      allUsers.forEach(user => {
        const newUser: UserInListDto = {
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          description: user.description,
          displayName: UnitService.getUserDisplayName(user),
          email: user.emailPublishApproved ? user.email : ''
        };
        if (user.isAdmin) {
          returnUsers.admins.push(newUser);
        } else if (workspaceGroupAdmins.indexOf(user.id) >= 0) {
          returnUsers.workspaceGroupAdmins.push(newUser);
        } else if (users.indexOf(user.id) >= 0) {
          returnUsers.users.push(newUser);
        }
      });
    });
    return returnUsers;
  }

  async findAllFull(workspaceId?: number): Promise<UserFullDto[]> {
    const validUsers: number[] = [];
    if (workspaceId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository
        .find({ where: { workspaceId: workspaceId } });
      workspaceUsers.forEach(wsU => validUsers.push(wsU.userId));
    }
    const users: User[] = await this.usersRepository.find({ order: { name: 'ASC' } });
    const returnUsers: UserFullDto[] = [];
    users.forEach(user => {
      if (!workspaceId || (validUsers.indexOf(user.id) > -1)) {
        returnUsers.push(<UserFullDto>{
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          description: user.description,
          lastName: user.lastName,
          firstName: user.firstName,
          email: user.email,
          emailPublishApproved: user.emailPublishApproved
        });
      }
    });
    return returnUsers;
  }

  async findOne(id: number): Promise<UserFullDto> {
    this.logger.log(`Returning user with id: ${id}`);
    const user = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (user) {
      return <UserFullDto>{
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin,
        description: user.description,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailPublishApproved: user.emailPublishApproved
      };
    }
    throw new AdminUserNotFoundException(id, 'GET');
  }

  async hasUsers(): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: MoreThan(0) },
      select: { id: true }
    });
    return !!user;
  }

  async create(user: CreateUserDto): Promise<number> {
    this.logger.log(`Creating user with name: ${user.name}`);
    user.password = UsersService.getPasswordHash(user.password);
    const newUser = this.usersRepository.create(user);
    await this.usersRepository.save(newUser);
    return newUser.id;
  }

  async getUserByNameAndPassword(name: string, password: string): Promise<number | null> {
    const user = await this.usersRepository.findOne({
      where: { name: name },
      select: { id: true, password: true }
    });
    if (user && bcrypt.compareSync(password, user.password)) {
      return user.id;
    }
    return null;
  }

  async getUserIsAdmin(userId: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { isAdmin: true }
    });
    if (user) return user.isAdmin;
    return false;
  }

  async setPassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    this.logger.log(`Setting password for user with id: ${userId}.`);
    const userForName = await this.usersRepository.findOne({
      where: { id: userId },
      select: { name: true }
    });
    if (userForName) {
      const userForId = await this.getUserByNameAndPassword(userForName.name, oldPassword);
      if (userForId) {
        const userToUpdate = await this.usersRepository.findOne({
          where: { id: userForId }
        });
        userToUpdate.password = UsersService.getPasswordHash(newPassword);
        await this.usersRepository.save(userToUpdate);
        return true;
      }
    }
    return false;
  }

  async canAccessWorkSpace(userId: number, workspaceId: number): Promise<boolean> {
    const wsUser = await this.workspaceUsersRepository.findOne({
      where: { userId: userId, workspaceId: workspaceId }
    });
    if (wsUser) return true;
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { groupId: true }
    });
    return this.isWorkspaceGroupAdmin(userId, workspace.groupId);
  }

  async canAccessReview(userId: number, reviewId: number): Promise<boolean> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      select: { workspaceId: true }
    });
    if (review) return this.canAccessWorkSpace(userId, review.workspaceId);
    return false;
  }

  async isWorkspaceGroupAdmin(userId: number, workspaceGroupId?: number): Promise<boolean> {
    if (workspaceGroupId) {
      const wsgAdmin = await this.workspaceGroupAdminRepository.findOne({
        where: { workspaceGroupId: workspaceGroupId, userId: userId }
      });
      return !!wsgAdmin;
    }
    const wsgAdmin = await this.workspaceGroupAdminRepository.findOne({
      where: { userId: userId }
    });
    return !!wsgAdmin;
  }

  async getLongName(userId: number): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { lastName: true, firstName: true, name: true }
    });
    if (user) {
      if (user.lastName) return user.firstName ? `${user.lastName}, ${user.firstName}` : user.lastName;
      return user.firstName || '';
    }
    return '';
  }

  async remove(id: number | number[]): Promise<void> {
    this.logger.log(`Deleting user with id: ${id}`);
    await this.usersRepository.delete(id);
  }

  async patch(userId: number, userData: UserFullDto): Promise<void> {
    this.logger.log(`Updating user with id: ${userId}`);
    const userToUpdate = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        name: true,
        isAdmin: true,
        description: true,
        password: true,
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });
    if (userToUpdate) {
      if (typeof userData.isAdmin === 'boolean') userToUpdate.isAdmin = userData.isAdmin;
      if (userData.name) userToUpdate.name = userData.name;
      if (userData.description) userToUpdate.description = userData.description;
      if (userData.password) userToUpdate.password = UsersService.getPasswordHash(userData.password);
      if (userData.lastName) userToUpdate.lastName = userData.lastName;
      if (userData.firstName) userToUpdate.firstName = userData.firstName;
      if (userData.email) userToUpdate.email = userData.email;
      await this.usersRepository.save(userToUpdate);
    } else {
      throw new AdminUserNotFoundException(userData.id, 'PATCH');
    }
  }

  async patchMyData(userData: MyDataDto): Promise<void> {
    const userToUpdate = await this.usersRepository.findOne({
      where: { id: userData.id },
      select: {
        description: true,
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        emailPublishApproved: true
      }
    });
    if (userData.description) userToUpdate.description = userData.description;
    if (userData.lastName) userToUpdate.lastName = userData.lastName;
    if (userData.firstName) userToUpdate.firstName = userData.firstName;
    if (userData.email) userToUpdate.email = userData.email;
    if (typeof userData.emailPublishApproved === 'boolean') {
      userToUpdate.emailPublishApproved = userData.emailPublishApproved;
    }
    await this.usersRepository.save(userToUpdate);
  }

  async setUsersByWorkspace(workspaceId: number, users: UserWorkspaceAccessDto[]) {
    this.logger.log(`Adding users for workspaceId: ${workspaceId}`);
    return this.workspaceUsersRepository.delete({ workspaceId: workspaceId }).then(async () => {
      await Promise.all(users.map(async user => {
        const newWorkspaceUser = this.workspaceUsersRepository.create(<WorkspaceUser>{
          userId: user.id,
          workspaceId: workspaceId,
          accessLevel: user.accessLevel
        });
        await this.workspaceUsersRepository.save(newWorkspaceUser);
        const units = await this.unitService.findAllForWorkspace(workspaceId);

        await Promise.all(units.map(async unit => {
          this.unitUserService.findByUnitId(unit.id).then(async unitUsers => {
            const unitUsersIds = unitUsers.map(unitUser => unitUser.userId);
            if (!unitUsersIds.includes(user.id)) {
              await this.unitUserService.createUnitUser(user.id, unit.id);
            } else {
              unitUsersIds.map(async unitUserId => {
                if (!users.find(u => u.id === unitUserId)) {
                  await this.unitUserService.deleteUnitUsers(workspaceId, unitUserId);
                }
              });
            }
          });
        }));
      }));
    });
  }

  // TODO: mit Dtos
  async setWorkspaceGroupAdmins(workspaceGroupId: number, users: number[]) {
    return this.workspaceGroupAdminRepository.delete({ workspaceGroupId: workspaceGroupId }).then(async () => {
      await Promise.all(users.map(async userId => {
        const newWorkspaceGroupAdmin = this.workspaceGroupAdminRepository.create(<WorkspaceGroupAdmin>{
          userId: userId,
          workspaceGroupId: workspaceGroupId
        });
        await this.workspaceGroupAdminRepository.save(newWorkspaceGroupAdmin);
      }));
    });
  }

  private static getPasswordHash(stringToHash: string): string {
    return bcrypt.hashSync(stringToHash, 11);
  }
}
