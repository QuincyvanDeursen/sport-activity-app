import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@sport-activity-app/domain';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User as UserModel } from '../Schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>
  ) {}

  //creating a user.
  async create(user: User): Promise<UserModel> {
    const createdUser = new this.userModel(user);
    return await createdUser.save();
  }

  //finding a user by email.
  async findUserByEmail(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return user;
  }
}
