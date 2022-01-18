import { Injectable } from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../../database/services/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
) {}

  async validateUser(username: string, pass: string): Promise<number | null> {
    return this.usersService.getUserByNameAndPassword(username, pass);
  }

  async login(user) {
    const payload = { username: user.name, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async isAdminUser(req): Promise<boolean> {
    const userId = req.user.id;
    const isAdmin = await this.usersService.getUserIsAdmin(userId);
    return isAdmin ? isAdmin : false;
  }
}
