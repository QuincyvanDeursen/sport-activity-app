import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type AddressDocument = HydratedDocument<Address>;

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
export const AddressSchema = SchemaFactory.createForClass(Address);
