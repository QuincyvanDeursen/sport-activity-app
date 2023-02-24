import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

import { MongooseModule } from '@nestjs/mongoose';
import { environment } from '../environments/environment';
import { SportEventModule } from '../sport-event/sport-event.module';
@Module({
  imports: [
    MongooseModule.forRoot(environment.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    AuthModule,
    UserModule,
    SportEventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
