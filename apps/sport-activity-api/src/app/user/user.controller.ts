import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Query,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Role, User } from '@sport-activity-app/domain';
import { HasRoles } from '../auth/AuthTsFiles/roles.decorator';
import { RolesGuard } from '../auth/AuthTsFiles/roles.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //register endpoint
  @Post('register')
  async register(@Body() user: User): Promise<object> {
    const result = await this.userService.create(user);
    return result;
  }
  //get all users by firstname and lastname endpoint

  //get all users endpoint (no employees/admins)
  @Get()
  async getAllUsers(): Promise<User[]> {
    console.log('get all users controller');
    const result = await this.userService.getAllUsers();
    return result;
  }

  //get user by id endpoint
  @Get(':id')
  async getUserById(@Request() req): Promise<User> {
    const result = await this.userService.findUserById(req.params.id);
    return result;
  }

  //get user by email endpoint
  @Get(':email')
  async getUserByEmail(@Request() req): Promise<User> {
    const result = await this.userService.findUserByEmail(req.params.email);
    return result;
  }

  //follow user endpoint
  @HasRoles(Role.User)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('follow')
  async followUser(
    @Body() followRequest: { currentUserId: string; userToFollowId: string }
  ): Promise<object> {
    const result = await this.userService.followUser(
      followRequest.currentUserId,
      followRequest.userToFollowId
    );
    return result;
  }

  //delete use endpoint
  @HasRoles(Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('delete/:id')
  async deleteUser(@Request() deleteUser): Promise<object> {
    console.log(deleteUser.params.id);
    console.log(
      'Delete user called from user.controller.ts (api) with id: ' +
        deleteUser.params.id
    );
    const result = await this.userService.deleteUser(deleteUser.params.id);
    return result;
  }

  //profile
  @Get('profile')
  getProfile(@Request() req) {
    return 'werkt';
  }
}
