import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {getConnection, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import User from "../entities/user.entity";
import VeronaModule from "../entities/verona-module.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  getUserByNameAndPassword(name: string, password: string): Promise<User | null> {
    return getConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .where("user.name = :name, user.password = encode(digest(:password, 'sha1'), 'hex')",
        { name: name, password: password })
      .getOne();
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
