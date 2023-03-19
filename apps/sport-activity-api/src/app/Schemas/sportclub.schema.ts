import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { Address } from './address.schema';
export type SportclubDocument = HydratedDocument<Sportclub>;

@Schema({ timestamps: true })
export class Sportclub {
  @Prop({ required: true })
  clubName: string;

  @Prop({
    required: true,
    validate: {
      validator: (value: string) => {
        // Check if the value matches the website format
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
      },
      message: 'Invalid website URL',
    },
  })
  websiteURL: string;

  @Prop({
    required: true,
    validate: {
      validator: (value: string) => {
        // Check if the value matches the email format
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Invalid email address',
    },
  })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  address: Address;

  @Prop({ timestamps: true })
  createdAt: Date;

  @Prop({ timestamps: { updatedAt: true } })
  updatedAt: Date;
}
export const SportclubSchema = SchemaFactory.createForClass(Sportclub);
