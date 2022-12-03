import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@sport-activity-app/domain';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Post('register')
  register(@Body() user: User): Promise<any> {
    return this.userService.create(user);
  }
}
