import { Injectable } from '@nestjs/common';
import { getConnection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UserFullDto, UserInListDto } from '@studio-lite-lib/api-dto';
import User from '../entities/user.entity';
import { passwordHash } from '../../auth/auth.constants';
import WorkspaceUser from '../entities/workspace-user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>
  ) {}

  async findAll(workspaceId?: number): Promise<UserInListDto[]> {
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
          email: user.email
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
      email: user.email
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

  async getUserIsAdmin(userId: number): Promise<boolean | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { isAdmin: true }
    });
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

  async setUsersByWorkspace(workspaceId: number, users: number[]) {
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
}
