import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './AuthTsFiles/local.strategy';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './AuthTsFiles/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
