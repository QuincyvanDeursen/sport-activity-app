import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User } from '@sport-activity-app/domain';
import { User as UserModel } from '../Schemas/user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //profile endpoint
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  //register endpoint
  @Post('register')
  async register(@Body() user: User): Promise<UserModel> {
    return await this.userService.create(user);
  }
}
