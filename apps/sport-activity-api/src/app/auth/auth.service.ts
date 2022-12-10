import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<object> {
    console.log('auth service method ValidateUser called');
    const user = await this.usersService.findUserByEmail(email);
    if (user && user.password === pass) {
      console.log(
        'auth service validateUser: password does match with found user.'
      );
      const { password, ...result } = user;
      return {
        statusCode: 201,
        result: result,
      };
    }
    console.log(
      'autch service validateUser: Password did not match with found user.'
    );
    return null;
  }
  // This method is called by the auth controller

  async login(user): Promise<object> {
    const result = user.result;
    const payload = {
      _id: result._id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      city: result.city,
      roles: result.roles,
      sportclub: result.sportclub,
      followingUsers: result.followingUsers,
    };
    console.log('auth service Login method got user data and payload:');
    console.log(user);
    console.log(payload);
    return {
      statusCode: 200,
      access_token: this.jwtService.sign(payload),
    };
  }

  getAuthToken(): string {
    console.log('auth service getAuthToken method called (api)');
    console.log(localStorage.getItem('token'));
    return localStorage.getItem('token');
  }
}
