import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '@sport-activity-app/domain';
import mongoose, { HydratedDocument } from 'mongoose';
import { Sportclub } from './sportclub.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;
  @Prop({ required: true })
  city: string;
  @Prop({ required: true })
  roles: Role[];
  @Prop({ required: false, default: undefined })
  sportclub: Sportclub;
  @Prop({
    required: false,
    default: [],
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  })
  followingUsers: [];

  @Prop({
    required: false,
    default: [],
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SportEvent',
  })
  enrolledSportEvents: [];
}

export const UserSchema = SchemaFactory.createForClass(User);
