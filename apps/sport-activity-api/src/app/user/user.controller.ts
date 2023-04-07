import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Delete,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Role, User } from '@sport-activity-app/domain';
import { HasRoles } from '../auth/AuthTsFiles/roles.decorator';
import { RolesGuard } from '../auth/AuthTsFiles/roles.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //get user by id endpoint
  @Get(':id')
  async getUserById(@Request() req): Promise<User> {
    const result = await this.userService.findUserById(req.params.id);
    return result;
  }

  //register endpoint
  @Post('register')
  async register(@Body() user: User): Promise<object> {
    const result = await this.userService.create(user);
    return result;
  }

  //get all users endpoint (no employees/admins)
  @Get()
  async getAllUsers(): Promise<User[]> {
    console.log('get all users controller');
    const result = await this.userService.getAllUsers();
    return result;
  }

  //follow user endpoint
  @HasRoles(Role.User, Role.Admin)
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

  //unfollow user endpoint
  @HasRoles(Role.User, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('unfollow')
  async unfollowUser(
    @Body() followRequest: { currentUserId: string; userToUnfollowId: string }
  ): Promise<object> {
    console.log(`unfollow user controller (api) called.`);
    const result = await this.userService.unfollowUser(
      followRequest.currentUserId,
      followRequest.userToUnfollowId
    );
    return result;
  }

  //delete user endpoint
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

  //update account settings endpoint
  @HasRoles(Role.User, Role.Employee, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put()
  async updateAccountSettings(@Body() user: User): Promise<object> {
    console.log('update account settings called from user.controller.ts (api)');
    const result = await this.userService.updateAccountSettings(user);
    return result;
  }

  //update account settings endpoint
  @HasRoles(Role.Employee, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('statistics/:id')
  async getEmployeeStatistics(@Request() req): Promise<object> {
    console.log('get employee statistics called from user.controller.ts (api)');
    const result = await this.userService.getEmployeeStatistics(req.params.id);
    return result;
  }
}
