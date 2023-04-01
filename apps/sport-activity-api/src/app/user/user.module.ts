import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSchema } from '../Schemas/user.schema';
import { SportEventSchema } from '../Schemas/sportEvent.schema';
import { Neo4jQueryService } from '../../neo4-j/neo4-j.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'SportEvent', schema: SportEventSchema },
    ]),
  ],
  providers: [UserService, Neo4jQueryService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
