import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SportEventService } from './sport-event.service';
import { SportEventController } from './sport-event.controller';
import { SportEventSchema } from '../app/Schemas/sportEvent.schema';
import { UserSchema } from '../app/Schemas/user.schema';
import { Neo4jQueryService } from '../neo4-j/neo4-j.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SportEvent', schema: SportEventSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [SportEventService, Neo4jQueryService],
  exports: [SportEventService],
  controllers: [SportEventController],
})
export class SportEventModule {}
