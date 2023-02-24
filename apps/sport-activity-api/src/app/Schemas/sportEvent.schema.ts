import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
export type SportEventDocument = HydratedDocument<SportEvent>;

@Schema()
export class SportEvent {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  price: number;
  @Prop({ required: true })
  startDateAndTime: Date;
  @Prop({ required: true })
  durationInMinutes: number;
  @Prop({ required: true })
  maximumNumberOfParticipants: number;
  @Prop({
    required: false,
    default: [],
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  })
  enrolledParticipants: [];
  @Prop({ required: true })
  host: User;
}
export const SportEventSchema = SchemaFactory.createForClass(SportEvent);
