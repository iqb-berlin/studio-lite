import { Injectable } from '@nestjs/common';
import { UsersService } from '../../database/services/users.service';
import {JwtService} from "@nestjs/jwt";
import User from "../../database/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
) {}

  async validateUser(username: string, pass: string): Promise<number | null> {
    return this.usersService.getUserByNameAndPassword(username, pass);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
