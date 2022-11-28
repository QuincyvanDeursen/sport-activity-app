import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';

import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [AuthModule, UserModule, PassportModule],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
