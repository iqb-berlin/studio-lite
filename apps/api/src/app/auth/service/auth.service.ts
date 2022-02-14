import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../database/services/users.service';
import { WorkspaceService } from '../../database/services/workspace.service';
import { WorkspaceGroupService } from '../../database/services/workspace-group.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private workspaceService: WorkspaceService,
    private workspaceGroupService: WorkspaceGroupService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<number | null> {
    return this.usersService.getUserByNameAndPassword(username, pass);
  }

  async login(user) {
    const payload = { username: user.name, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async isAdminUser(userId: number): Promise<boolean> {
    const isAdmin = await this.usersService.getUserIsAdmin(userId);
    return isAdmin || false;
  }

  async canAccessWorkSpace(userId: number, workspaceId: number): Promise<boolean> {
    return this.usersService.canAccessWorkSpace(userId, workspaceId);
  }

  async getMyName(id: number): Promise<string> {
    return this.usersService.getUserName(id);
  }

  async setMyPassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
    return this.usersService.setPassword(id, oldPassword, newPassword);
  }
}
