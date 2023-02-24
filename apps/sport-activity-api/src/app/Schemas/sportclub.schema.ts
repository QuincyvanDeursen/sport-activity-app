import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { Address } from './address.schema';
export type SportclubDocument = HydratedDocument<Sportclub>;

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
export const SportclubSchema = SchemaFactory.createForClass(Sportclub);
