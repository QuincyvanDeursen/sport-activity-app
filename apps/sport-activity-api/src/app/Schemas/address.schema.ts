import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type AddressDocument = Address & Document;

@Schema()
export class Address {
  @Prop({ required: true })
  city: string;
  @Prop({ required: true })
  zipCode: string;
  @Prop({ required: true })
  street: string;
  @Prop({ required: true })
  houseNumber: string;
}
export const UserSchema = SchemaFactory.createForClass(Address);
