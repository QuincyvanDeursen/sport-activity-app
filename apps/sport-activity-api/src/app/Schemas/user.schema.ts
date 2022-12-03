import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { Sportclub } from './sportclub.schema';

@Schema()
export class User extends Document {
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
