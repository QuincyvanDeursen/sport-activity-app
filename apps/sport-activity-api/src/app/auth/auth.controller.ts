import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@sport-activity-app/domain';
import { AuthService } from './auth.service';
import { HasRoles } from './AuthTsFiles/roles.decorator';
import { RolesGuard } from './AuthTsFiles/roles.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    console.log('auth controller: Login called');

    return this.authService.login(req.user);
  }

  @HasRoles(Role.Employee, Role.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('employee')
  onlyAdmin(@Request() req) {
    return req.user;
  }

  @HasRoles(Role.User)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('user')
  onlyUser(@Request() req) {
    return req.user;
  }
}
