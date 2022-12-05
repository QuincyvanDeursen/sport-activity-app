import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { Address } from './address.schema';
export type AddressDocument = Address & Document;

@Schema()
export class Sportclub {
  @Prop({ required: true })
  clubName: string;
  @Prop({ required: true })
  websiteURL: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  phoneNumber: string;
  @Prop({ required: true })
  address: Address;
}
export const UserSchema = SchemaFactory.createForClass(Sportclub);
