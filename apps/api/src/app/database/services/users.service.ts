import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto, MyDataDto, UserFullDto, UserInListDto
} from '@studio-lite-lib/api-dto';
import User from '../entities/user.entity';
import { passwordHash } from '../../auth/auth.constants';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import Workspace from '../entities/workspace.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>,
    @InjectRepository(WorkspaceGroupAdmin)
    private workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>
  ) {}

  async findAllUsers(workspaceId?: number): Promise<UserInListDto[]> {
    const validUsers: number[] = [];
    if (workspaceId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository
        .find({ where: { workspaceId: workspaceId } });
      workspaceUsers.forEach(wsU => validUsers.push(wsU.userId));
    }
    const users: User[] = await this.usersRepository.find({ order: { name: 'ASC' } });
    const returnUsers: UserInListDto[] = [];
    users.forEach(user => {
      if (!workspaceId || (validUsers.indexOf(user.id) > -1)) {
        const displayName = user.lastName ? user.lastName : user.name;
        returnUsers.push(<UserInListDto>{
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          description: user.description,
          displayName: user.firstName ? `${displayName}, ${user.firstName}` : displayName
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
        const displayName = user.lastName ? user.lastName : user.name;
        returnUsers.push(<UserInListDto>{
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          description: user.description,
          displayName: user.firstName ? `${displayName}, ${user.firstName}` : displayName
        });
      }
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
    const user = await this.usersRepository.findOne({
      where: { id: id }
    });
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

  async create(user: CreateUserDto): Promise<number> {
    user.password = UsersService.getPasswordHash(user.password);
    const newUser = await this.usersRepository.create(user);
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

  async remove(id: number | number[]): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async patch(userData: UserFullDto): Promise<void> {
    const userToUpdate = await this.usersRepository.findOne({
      where: { id: userData.id },
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
    if (typeof userData.isAdmin === 'boolean') userToUpdate.isAdmin = userData.isAdmin;
    if (userData.name) userToUpdate.name = userData.name;
    if (userData.description) userToUpdate.description = userData.description;
    if (userData.lastName) userToUpdate.lastName = userData.lastName;
    if (userData.firstName) userToUpdate.firstName = userData.firstName;
    if (userData.email) userToUpdate.email = userData.email;
    if (userData.password) userToUpdate.password = UsersService.getPasswordHash(userData.password);
    await this.usersRepository.save(userToUpdate);
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

  async setUsersByWorkspace(workspaceId: number, users: number[]) {
    return this.workspaceUsersRepository.delete({ workspaceId: workspaceId }).then(async () => {
      await Promise.all(users.map(async userId => {
        const newWorkspaceUser = await this.workspaceUsersRepository.create(<WorkspaceUser>{
          userId: userId,
          workspaceId: workspaceId
        });
        await this.workspaceUsersRepository.save(newWorkspaceUser);
      }));
    });
  }

  async setWorkspaceGroupAdmins(workspaceGroupId: number, users: number[]) {
    return this.workspaceGroupAdminRepository.delete({ workspaceGroupId: workspaceGroupId }).then(async () => {
      await Promise.all(users.map(async userId => {
        const newWorkspaceGroupAdmin = await this.workspaceGroupAdminRepository.create(<WorkspaceGroupAdmin>{
          userId: userId,
          workspaceGroupId: workspaceGroupId
        });
        await this.workspaceGroupAdminRepository.save(newWorkspaceGroupAdmin);
      }));
    });
  }

  async setWorkspaceGroupAdminsByWorkspaceGroup(workspaceGroupId: number, users: number[]) {
    return this.workspaceGroupAdminRepository.delete({ workspaceGroupId: workspaceGroupId }).then(async () => {
      await Promise.all(users.map(async userId => {
        const newWorkspaceGroupAdmin = await this.workspaceGroupAdminRepository.create(<WorkspaceGroupAdmin>{
          userId: userId,
          workspaceGroupId: workspaceGroupId
        });
        await this.workspaceGroupAdminRepository.save(newWorkspaceGroupAdmin);
      }));
    });
  }

  private static getPasswordHash(stringToHash: string): string {
    return bcrypt.hashSync(stringToHash, passwordHash.salt);
  }
}
