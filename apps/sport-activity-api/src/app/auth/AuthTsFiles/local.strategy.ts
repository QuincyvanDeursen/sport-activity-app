import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  //this method gets the body to login
  async validate(email: string, password: string): Promise<any> {
    console.log('Auth Local.strategy.ts: trying to log in');
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.log('Auth Local.strategy.ts: log in failed');
      throw new HttpException('Ongeldige email en wachtwoord combinatie', 401);
    }
    console.log('Auth Local.strategy.ts: log in succesfull');
    return user;
  }
}
