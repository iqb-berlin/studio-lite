import {Injectable} from '@nestjs/common';
import {getConnection, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import User from "../entities/user.entity";
import * as bcrypt from 'bcrypt';
import {CreateUserDto, UserFullDto, UserInListDto} from "@studio-lite-lib/api-admin";
import {passwordHash} from "../../auth/auth.constants";
import WorkspaceUser from "../entities/workspace-user.entity";
import {WorkspaceGroupDto} from "@studio-lite-lib/api-start";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findAll(): Promise<UserInListDto[]> {
    const users: User[] = await this.usersRepository.find();
    const returnUsers: UserInListDto[] = [];
    users.forEach(user => returnUsers.push(<UserInListDto>{
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin
    }));
    return returnUsers;
  }

  async findOne(id: number): Promise<UserFullDto> {
    const user = await this.usersRepository.findOne(id);
    return <UserFullDto>{
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      email: user.email
    }
  }

  async create(user: CreateUserDto): Promise<number> {
    user.password = UsersService.getPasswordHash(user.password);
    const newUser = await this.usersRepository.create(user);
    await this.usersRepository.save(newUser);
    return newUser.id;
  }

  async getUserByNameAndPassword(name: string, password: string): Promise<number | null> {
    const user = await getConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.name = :name",
        {name: name})
      .getOne();
    if (user && bcrypt.compareSync(password, user.password)) {
      return user.id
    }
    return null
  }

  async getUserIsAdmin(userId: number): Promise<boolean | null> {
    const user = await getConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :id",
        {id: userId})
      .getOne();
    if (user) {
      return user.isAdmin
    }
    return null
  }

  async getUserName(userId: number): Promise<string> {
    const user = await getConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.id = :id",
        {id: userId})
      .getOne();
    return user.name
  }

  async getWorkspacesByUser(userId: number): Promise<WorkspaceGroupDto[]> {
    console.log(`get workspaces for user id ${userId}`);
    // todo grab from database
    return []
  }

  async canAccessWorkSpace(userId: number, workspaceId: number): Promise<boolean> {
    const wsUser = await getConnection()
      .getRepository(WorkspaceUser)
      .createQueryBuilder("ws_user")
      .where("ws_user.user_id = :user_id and ws_user.workspace_id = :ws_id",
        {user_id: userId, ws_id: workspaceId})
      .getOne();
    if (wsUser) {
      return true
    }
    return false
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  private static getPasswordHash(stringToHash: string): string {
    return bcrypt.hashSync(stringToHash, passwordHash.salt);
  }
}
