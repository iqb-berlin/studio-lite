import {
  Body,
  Controller, Get, Param, Post, UseFilters, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseFilters(HttpExceptionFilter)
export class ProfileController {
  constructor(
    private profileService: ProfileService
  ) {
  }

  @Get('vocab/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getVocab(@Param('id') id: string) {
    return this.profileService.getVocab(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  @Post('vocabs')
  @ApiBearerAuth()
  async saveVocab(@Body() vocabs:any) {
    return this.profileService.saveVocabs(vocabs);
  }

  @Post()
  @ApiBearerAuth()
  async saveProfile(@Body() profile:any) {
    return this.profileService.saveProfile(profile);
  }
}
