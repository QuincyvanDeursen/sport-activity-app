import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '@sport-activity-app/domain';
import mongoose, { HydratedDocument } from 'mongoose';
import { Sportclub } from './sportclub.schema';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: (value: string) => {
        // Check if the value matches the email format
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Invalid email address',
    },
  })
  email: string;

  @Prop({
    required: true,
    validate: {
      validator: (value: string) => {
        // Check if the value matches the password format
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[a-zA-Z\d\W]{8,}$/.test(
          value
        );
      },
      message:
        'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, 1 special character, and a minimum of 8 characters in length',
    },
  })
  password: string;

  @Prop({
    required: true,
    validate: {
      validator: (value: string) => {
        // Check if the value contains only letters
        return /^[a-zA-Z]+$/.test(value);
      },
      message: 'First name should contain only letters',
    },
  })
  firstName: string;

  @Prop({
    required: true,
    validate: {
      validator: (value: string) => {
        // Check if the value contains only letters
        return /^[a-zA-Z ]+$/.test(value);
      },
      message: 'Last name should contain only letters',
    },
  })
  lastName: string;

  @Prop({
    required: true,
    validate: {
      validator: (value: string) => {
        // Check if the value contains only letters
        return /^[a-zA-Z\s'-]+$/.test(value);
      },
      message: 'City should contain only letters, spaces, or -',
    },
  })
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

//pre save hook password hash
UserSchema.pre<User>('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;

    return next();
  } catch (err) {
    return next(err);
  }
});
