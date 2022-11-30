import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'), // todo .env moet deze string hebben
    });
  }

  async validate(payload: any) {
    console.log('jwt.strategy.ts called with payload: ');
    console.log(payload);
    return {
      email: payload.email,
      roles: payload.roles,
    };
  }
}
