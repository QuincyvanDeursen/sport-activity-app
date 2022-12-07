import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@sport-activity-app/domain';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../Schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>
  ) {}

  //creating a user.
  async create(user: User): Promise<object> {
    try {
      const createdUser = new this.userModel(user);
      createdUser.email = user.email.toLowerCase();
      await createdUser.save();
      return {
        statusCode: 201,
        message: `User ${createdUser.firstName} created`,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException(
          'Duplicate entry, email has to be unique.',
          409
        );
      } else {
        throw new HttpException(error.message, 400);
      }
    }
  }

  //finding a user by email.
  async findUserByEmail(email: string): Promise<any> {
    const lowerCaseEmail = email.toLowerCase();
    const user = await this.userModel.findOne({ email: lowerCaseEmail }).lean();
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }
}
