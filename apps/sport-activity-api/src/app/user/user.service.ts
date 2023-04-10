import { HttpException, Inject, Injectable } from '@nestjs/common';
import { User } from '@sport-activity-app/domain';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserDocument } from '../Schemas/user.schema';
import { SportEventDocument } from '../Schemas/sportEvent.schema';
import * as bcrypt from 'bcrypt';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('SportEvent')
    private readonly sportEventModel: Model<SportEventDocument>,
    private readonly neo4jService: Neo4jService
  ) {}

  ////////////////////////////////////////
  //////////// Create User ///////////////
  ////////////////////////////////////////

  //creating a user.
  async create(user: User): Promise<object> {
    let userInMongoDB: { mongoId: string; firstName: string };
    try {
      userInMongoDB = await this.createUserInMongoDB(user);
      const userIncreaeNeo4j = await this.createUserInNeo4j(
        userInMongoDB.firstName,
        userInMongoDB.mongoId
      );
      if (userIncreaeNeo4j && userInMongoDB) {
        return {
          statusCode: 201,
          message: `User succesfully created`,
        };
      }
    } catch (error) {
      if (userInMongoDB) {
        await this.userModel.findByIdAndDelete(userInMongoDB.mongoId).lean();
      }
      throw new HttpException(error.message, 400);
    }
  }

  //create user in mongoDB
  async createUserInMongoDB(
    user: User
  ): Promise<{ mongoId: string; firstName: string }> {
    try {
      const createdUser = new this.userModel(user);
      createdUser.email = user.email.toLowerCase();
      createdUser.firstName = user.firstName.toLowerCase();
      createdUser.lastName = user.lastName.toLowerCase();

      console.log(user);

      await createdUser.save();
      const userInMongoDB = {
        mongoId: createdUser._id.toString(),
        firstName: createdUser.firstName,
      };
      return userInMongoDB;
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

  //create user in neo4j
  async createUserInNeo4j(userName: string, userId: string): Promise<boolean> {
    try {
      await this.neo4jService.write(
        `CREATE (n:User {mongoId: "${userId}", name: "${userName}"}) RETURN n`
      );
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ////////////////////////////////////////
  //////////// Getting users /////////////
  ////////////////////////////////////////

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
    const user = await this.userModel.findById(id).lean();
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    delete user.password;
    return user;
  }

  //getting all users without password (no employees/admins).
  async getAllUsers(): Promise<User[]> {
    console.log('get all users service (api) called');
    const result: User[] = await this.userModel
      .find({ roles: { $in: ['user'] } })
      .select('-password')
      .lean();

    return result;
  }

  async getAllEmployees(): Promise<User[]> {
    console.log('get all employees service (api) called');
    const result: User[] = await this.userModel
      .find({ roles: { $in: ['employee'] } })
      .select('-password')
      .lean();

    return result;
  }

  ////////////////////////////////////////
  //////////// Follow users //////////////
  ////////////////////////////////////////

  //follow user
  async followUser(
    currentUserId: string,
    userToFollowId: string
  ): Promise<object> {
    console.log('follow user service (api) called');
    let userInMongoDB;
    try {
      userInMongoDB = await this.followUserInMongoDB(
        currentUserId,
        userToFollowId
      );
      const userInNeo4j = await this.followUserInNeo4j(
        currentUserId,
        userToFollowId
      );
      if (userInMongoDB && userInNeo4j) {
        return {
          statusCode: 201,
          message: `User ${userInMongoDB.firstName} now follows user with id: ${userToFollowId}`,
        };
      }
    } catch (error) {
      //rolback
      if (userInMongoDB) {
        await this.userModel
          .findByIdAndUpdate(
            currentUserId,
            { $pull: { followingUsers: userToFollowId } },
            { new: true }
          )
          .lean();
      }
      throw new HttpException(error.message, 400);
    }
  }

  async followUserInMongoDB(currentUserId, userToFollowId) {
    console.log('follow user service (api) called (mongoDB)');
    if (currentUserId === userToFollowId) {
      throw new HttpException('You cannot follow yourself', 400);
    }
    const userToFollow = await this.userModel.findById(userToFollowId).lean();
    if (!userToFollow) {
      throw new HttpException('User to follow not found', 404);
    }

    const currentUser = await this.userModel.findById(currentUserId).lean();
    if (!currentUser) {
      throw new HttpException('currentUser not found', 404);
    }
    await this.userModel
      .findByIdAndUpdate(
        currentUserId,
        { $addToSet: { followingUsers: userToFollowId } },
        { new: true }
      )
      .lean();

    //neo4j needs to be implemented here
    return {
      statusCode: 201,
      message: `User with id ${currentUserId} now follows user with id: ${userToFollowId}`,
    };
  }

  //follow user in neo4j
  async followUserInNeo4j(
    currentUserId: string,
    userToFollowId: string
  ): Promise<boolean> {
    console.log('follow user service (api) called (neo4j)');
    try {
      await this.neo4jService.write(
        `MATCH (a:User {mongoId: "${currentUserId}"}) 
        MATCH (b:User {mongoId: "${userToFollowId}"}) 
        WHERE a <> b 
        CREATE (a)-[r:FOLLOWS]->(b) 
        `
      );
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ////////////////////////////////////////
  //////////// Unfollow users ////////////
  ////////////////////////////////////////

  //unfollow user
  async unfollowUser(
    currentUserId: string,
    userToUnfollowId: string
  ): Promise<object> {
    console.log('unfollow user service (api) called');
    let mongoResult;
    try {
      mongoResult = await this.unfollowUserInMongoDB(
        currentUserId,
        userToUnfollowId
      );
      const neo4jResult = await this.unfollowUserInNeo4j(
        currentUserId,
        userToUnfollowId
      );
      console.log(currentUserId);
      if (mongoResult && neo4jResult) {
        return {
          statusCode: 201,
          message: `User with id ${currentUserId} now no longer follows user with id: ${userToUnfollowId}`,
        };
      }
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message,
      };
    }
  }

  async unfollowUserInMongoDB(
    currentUserId: string,
    userToUnfollowId: string
  ): Promise<boolean> {
    console.log('unfollow user service (api) called (mongoDB)');
    try {
      if (currentUserId === userToUnfollowId) {
        throw new HttpException('You cannot unfollow yourself', 400);
      }
      const userToFollow = await this.userModel
        .findById(userToUnfollowId)
        .lean();
      if (!userToFollow) {
        throw new HttpException('User to unfollow not found', 404);
      }

      const currentUser = await this.userModel.findById(currentUserId).lean();
      if (!currentUser) {
        throw new HttpException('currentUser not found', 404);
      }
      await this.userModel
        .findByIdAndUpdate(
          currentUserId,
          { $pull: { followingUsers: userToUnfollowId } },
          { new: true }
        )
        .lean();
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //unfollow user in neo4j
  async unfollowUserInNeo4j(
    currentUserId: string,
    userToUnfollowId: string
  ): Promise<boolean> {
    console.log('unfollow user service (api) called (neo4j)');
    try {
      await this.neo4jService.write(
        `MATCH (a:User {mongoId: "${currentUserId}"})
        MATCH (b:User {mongoId: "${userToUnfollowId}"})
        WHERE a <> b
        MATCH (a)-[r:FOLLOWS]->(b)
        DELETE r
        `
      );
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ////////////////////////////////////////
  //////////// Delete   //////////////////
  ////////////////////////////////////////

  //delete user
  async deleteUser(_id: string): Promise<object> {
    console.log('deleteUser from user.service.ts (api) called');
    let mongoResult;
    try {
      mongoResult = await this.deleteUserInMongoDB(_id);
      const neo4jResult = await this.deleteUserInNeo4j(_id);
      if (mongoResult && neo4jResult) {
        return {
          statusCode: 200,
          message: `User ${mongoResult.firstName} deleted`,
        };
      }
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message,
      };
    }
  }

  async deleteUserInMongoDB(_id: string): Promise<boolean> {
    console.log('deleteUser from user.service.ts (api) called (mongoDB)');
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
      //delete all sportevents from users
      await this.sportEventModel.deleteMany({ hostId: _id }).lean();

      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async deleteUserInNeo4j(_id: string): Promise<boolean> {
    console.log('deleteUser from user.service.ts (api) called (neo4j)');
    try {
      await this.neo4jService.write(
        `MATCH (a:User {mongoId: "${_id}"})
        DETACH DELETE a
        `
      );
      await this.neo4jService.write(
        `MATCH (a:SportEvent {hostId: "${_id}"})
        DETACH DELETE a
        `
      );
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ////////////////////////////////////////
  ////////////     Update   //////////////
  ////////////////////////////////////////

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

  //////////////////////////////////////////
  ////////////     Statistics   ///////////
  ////////////////////////////////////////

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
