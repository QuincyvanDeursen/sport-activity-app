import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
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
  roles: string[];
  @Prop({ required: false, default: undefined })
  sportclub: Sportclub;
}
export const UserSchema = SchemaFactory.createForClass(User);
