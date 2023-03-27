import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@sport-activity-app/domain';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserDocument } from '../Schemas/user.schema';
import { SportEventDocument } from '../Schemas/sportEvent.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('SportEvent')
    private readonly sportEventModel: Model<SportEventDocument>
  ) {}

  //creating a user.
  async create(user: User): Promise<object> {
    try {
      const createdUser = new this.userModel(user);
      createdUser.email = user.email.toLowerCase();
      createdUser.firstName = user.firstName.toLowerCase();
      createdUser.lastName = user.lastName.toLowerCase();

      console.log(user);

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

  //finding a user by id.
  async findUserById(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password').lean();
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return user;
  }

  //getting all users without password (no employees/admins).
  async getAllUsers(): Promise<User[]> {
    console.log('get all users service (api) called');
    const result: User[] = await this.userModel
      .find({ roles: { $in: ['user'] } })
      .select('-password')
      .lean();
    if (!result || result.length === 0) {
      throw new HttpException('No usersfound', 404);
    }
    return result;
  }

  //follow user
  async followUser(
    currentUserId: string,
    userToFollowId: string
  ): Promise<object> {
    console.log('follow user service (api) called');
    const user: User = await this.userModel
      .findByIdAndUpdate(
        currentUserId,
        { $addToSet: { followingUsers: userToFollowId } },
        { new: true }
      )
      .lean();
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    //neo4j needs to be implemented here
    return {
      statusCode: 201,
      message: `User ${user.firstName} now follows user with id: ${userToFollowId}`,
    };
  }

  //unfollow user
  async unfollowUser(
    currentUserId: string,
    userToUnfollowId: string
  ): Promise<object> {
    console.log('unfollow user service (api) called');
    const user: User = await this.userModel
      .findByIdAndUpdate(
        currentUserId,
        { $pull: { followingUsers: userToUnfollowId } },
        { new: true }
      )
      .lean();
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    //neo4j needs to be implemented here
    return {
      statusCode: 201,
      message: `User ${user.firstName} now no longer follows user with id: ${userToUnfollowId}`,
    };
  }

  //delete user
  async deleteUser(_id: string): Promise<object> {
    console.log('deleteUser from user.service.ts (api) called');
    try {
      const user = await this.userModel.findByIdAndDelete(_id).lean();
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      //delete all references to user in other collections
      await this.userModel
        .updateMany({}, { $pull: { followingUsers: _id } })
        .lean();
      await this.sportEventModel
        .updateMany({}, { $pull: { enrolledParticipants: _id } })
        .lean();

      return {
        statusCode: 200,
        message: `User ${user.firstName} deleted`,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //update account settings (user)
  async updateAccountSettings(newUser: User): Promise<object> {
    try {
      console.log('updateAccountSettings from user.service.ts (api) called');
      const user = new this.userModel();
      Object.assign(user, newUser);

      const validationError = user.validateSync();
      if (validationError) {
        throw new HttpException(validationError.message, 400);
      }

      //hash password
      if (newUser.password) {
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);
      }

      const userUpdateResult = await this.userModel
        .findByIdAndUpdate(newUser._id, { $set: newUser }, { new: true })
        .lean();

      if (!userUpdateResult) {
        throw new HttpException('User not found', 404);
      }
      //update sportclub in events
      if (newUser.sportclub) {
        await this.sportEventModel
          .updateMany(
            { hostId: newUser._id },
            { $set: { sportclub: newUser.sportclub } }
          )
          .lean();
      }

      return {
        statusCode: 200,
        message: `User with id: ${newUser._id} updated`,
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

  // get employee statistics
  async getEmployeeStatistics(hostId: string): Promise<any> {
    const now = new Date();

    const pipeline = [
      // Match only sport events hosted by the specified host
      {
        $match: {
          hostId: new mongoose.Types.ObjectId(hostId),
        },
      },
      // Add a computed field to calculate the income for each sport event
      {
        $addFields: {
          income: { $multiply: ['$price', { $size: '$enrolledParticipants' }] },
          potentialIncome: {
            $multiply: ['$price', '$maximumNumberOfParticipants'],
          },
          completedEvents: { $lte: ['$startDateAndTime', now] },
        },
      },
      // Group the sport events by the host and calculate aggregate values
      {
        $group: {
          _id: '$hostId',
          totalEvents: { $sum: 1 },
          totalParticipants: { $sum: { $size: '$enrolledParticipants' } },
          totalIncome: {
            $sum: {
              $cond: [{ $lte: ['$startDateAndTime', now] }, '$income', 0],
            },
          },
          avgPrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' },
          avgDuration: { $avg: '$durationInMinutes' },
          maxDuration: { $max: '$durationInMinutes' },
          minDuration: { $min: '$durationInMinutes' },
          avgParticipants: { $avg: { $size: '$enrolledParticipants' } },
          maxParticipants: { $max: { $size: '$enrolledParticipants' } },
          minParticipants: { $min: { $size: '$enrolledParticipants' } },
          avgIncome: { $avg: '$income' },
          maxIncome: { $max: '$income' },
          minIncome: { $min: '$income' },
          potentialIncome: {
            $sum: {
              $cond: [
                { $gte: ['$startDateAndTime', now] },
                '$potentialIncome',
                0,
              ],
            },
          },
          totalCompletedEvents: {
            $sum: { $cond: [{ $lte: ['$startDateAndTime', now] }, 1, 0] },
          },
        },
      },
    ];

    const employeeStatistics = await this.sportEventModel.aggregate(pipeline);

    return employeeStatistics;
  }
}
