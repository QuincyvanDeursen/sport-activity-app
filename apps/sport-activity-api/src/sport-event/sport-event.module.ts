import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SportEventService } from './sport-event.service';
import { SportEventController } from './sport-event.controller';
import { SportEventSchema } from '../app/Schemas/sportEvent.schema';
import { UserSchema } from '../app/Schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SportEvent', schema: SportEventSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [SportEventService],
  exports: [SportEventService],
  controllers: [SportEventController],
})
export class SportEventModule {}
