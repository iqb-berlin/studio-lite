import { Injectable, Logger } from '@nestjs/common';
import { getConnection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UserFullDto, UserInListDto } from '@studio-lite-lib/api-dto';
import User from '../entities/user.entity';
import { passwordHash } from '../../auth/auth.constants';
import WorkspaceUser from '../entities/workspace-user.entity';
import { AdminUserNotFoundException } from '../../exceptions/admin-user-not-found.exception';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>
  ) {}

  async findAll(workspaceId?: number): Promise<UserInListDto[]> {
    // TODO: sollte Fehler liefern wenn eine nicht gültige workspaceId verwendet wird
    this.logger.log(`Returning users${workspaceId ? ` for workspaceId: ${workspaceId}` : '.'}`);
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
        returnUsers.push(<UserInListDto>{
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          description: user.description
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
        description: user.description
      };
    }
    throw new AdminUserNotFoundException(id, 'GET');
  }

  async create(user: CreateUserDto): Promise<number> {
    this.logger.log(`Creating workspace with name: ${user.name}`);
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

  async getUserIsAdmin(userId: number): Promise<boolean | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id',
        { id: userId })
      .getOne();
    if (user) {
      return user.isAdmin;
    }
    return null;
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
    const wsUser = await this.workspaceUsersRepository.createQueryBuilder('ws_user')
      .where('ws_user.user_id = :user_id and ws_user.workspace_id = :ws_id',
        { user_id: userId, ws_id: workspaceId })
      .getOne();
    return !!wsUser;
  }

  async remove(id: number | number[]): Promise<void> {
    this.logger.log(`Deleting user with id: ${id}`);
    await this.usersRepository.delete(id);
  }

  // TODO: id als Parameter
  async patch(userData: UserFullDto): Promise<void> {
    this.logger.log(`Updating user with id: ${userData.id}`);
    const userToUpdate = await this.usersRepository.findOne({
      where: { id: userData.id },
      select: {
        name: true, isAdmin: true, description: true, password: true, id: true
      }
    });
    if (userToUpdate) {
      if (typeof userData.isAdmin === 'boolean') userToUpdate.isAdmin = userData.isAdmin;
      if (userData.name) userToUpdate.name = userData.name;
      if (userData.description) userToUpdate.description = userData.description;
      if (userData.password) userToUpdate.password = UsersService.getPasswordHash(userData.password);
      await this.usersRepository.save(userToUpdate);
    } else {
      throw new AdminUserNotFoundException(userData.id, 'PATCH');
    }
  }

  async setUsersByWorkspace(workspaceId: number, users: number[]) {
    this.logger.log(`Creating ${users.length} users for workspaceId: ${workspaceId}`);
    await getConnection().createQueryBuilder()
      .delete()
      .from(WorkspaceUser)
      .where('workspace_id = :id', { id: workspaceId })
      .execute();
    await users.forEach(async userId => {
      const newWorkspaceUser = await this.workspaceUsersRepository.create(<WorkspaceUser>{
        userId: userId,
        workspaceId: workspaceId
      });
      await this.workspaceUsersRepository.save(newWorkspaceUser);
    });
  }

  private static getPasswordHash(stringToHash: string): string {
    return bcrypt.hashSync(stringToHash, passwordHash.salt);
  }

  removeIds(ids: number[]) {
    ids.forEach(id => this.remove(id));
  }
}
