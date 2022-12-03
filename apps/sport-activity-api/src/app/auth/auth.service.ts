import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('auth service method ValidateUser called');
    const user = await this.usersService.findUserByEmail(email);
    if (user && user.password === pass) {
      console.log(
        'auth service validateUser: password does match with found user.'
      );
      const { password, ...result } = user;
      return result;
    }
    console.log(
      'autch service validateUser: Password did not match with found user.'
    );
    return null;
  }
  async login(user: any) {
    const payload = {
      email: user._doc.email,
      firstname: user._doc.firstName,
      lastName: user._doc.lastName,
      city: user._doc.city,
      roles: user._doc.roles,
      sportclub: user._doc.sportclub,
    };
    console.log('auth service Login method got user data and payload:');
    console.log(user);
    console.log(payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
