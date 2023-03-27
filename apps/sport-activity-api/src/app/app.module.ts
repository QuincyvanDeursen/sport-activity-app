import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { Neo4jModule, Neo4jScheme } from 'nest-neo4j';
import { MongooseModule } from '@nestjs/mongoose';
import { environment } from '../environments/environment';
import { SportEventModule } from '../sport-event/sport-event.module';

@Module({
  imports: [
    Neo4jModule.forRoot({
      scheme: environment.NEO4J_URI as Neo4jScheme,
      host: environment.NEO4J_HOST,
      port: environment.NEO4J_PORT,
      username: environment.NEO4J_USERNAME,
      password: environment.NEO4J_PASSWORD,
    }),
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
