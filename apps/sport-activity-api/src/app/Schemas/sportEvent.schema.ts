import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose from 'mongoose';
import { Sportclub } from './sportclub.schema';
export type SportEventDocument = SportEvent & mongoose.Document;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class SportEvent {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    min: 0,
    validate: {
      validator: (value: number) => {
        // Check if the value is a positive number
        return value >= 0;
      },
      message: 'Price must be a positive number',
    },
  })
  price: number;

  @Prop({ required: true })
  startDateAndTime: Date;

  @Prop({
    required: true,
    min: 0,
    validate: {
      validator: (value: number) => {
        // Check if the value is a positive number
        return value >= 0;
      },
      message: 'Duration must be a positive number',
    },
  })
  durationInMinutes: number;

  @Prop({
    required: true,
    min: 1,
    validate: {
      validator: (value: number) => {
        // Check if the value is a positive number greater than or equal to 1
        return value >= 1;
      },
      message:
        'Maximum number of participants must be a positive number greater than or equal to 1',
    },
  })
  maximumNumberOfParticipants: number;

  @Prop({
    required: false,
    default: [],
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  })
  enrolledParticipants: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: true })
  hostId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  sportclub: Sportclub;
}

export const SportEventSchema = SchemaFactory.createForClass(SportEvent);

//virtuals
SportEventSchema.virtual('enrolledParticipantsCount').get(function () {
  return this.enrolledParticipants.length;
});

SportEventSchema.virtual('maximumIncome').get(function () {
  return this.maximumNumberOfParticipants * this.price;
});

SportEventSchema.virtual('currentIncome').get(function () {
  return this.enrolledParticipants.length * this.price;
});

SportEventSchema.virtual('isFull').get(function () {
  return this.enrolledParticipants.length >= this.maximumNumberOfParticipants;
});
