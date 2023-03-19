import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SportEvent, User } from '@sport-activity-app/domain';
import { Model } from 'mongoose';
import { SportEventDocument } from '../app/Schemas/sportEvent.schema';
import { UserDocument } from '../app/Schemas/user.schema';

@Injectable()
export class SportEventService {
  constructor(
    @InjectModel('SportEvent')
    private readonly sportEventModel: Model<SportEventDocument>,
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>
  ) {}

  // get all sport events.
  async getAllSportEvents(): Promise<SportEvent[]> {
    console.log('get all sportevents service (api) called');
    try {
      const result: SportEvent[] = await this.sportEventModel.find();
      console.log(result);
      return result;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //creating a sport event.
  async create(sportEvent: SportEvent): Promise<object> {
    console.log('create sportevent service (api) called');
    try {
      const createdSportEvent = new this.sportEventModel(sportEvent);
      await createdSportEvent.save();
      return {
        statusCode: 201,
        message: `SportEvent ${createdSportEvent.title} created`,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //finding a sport event by id.
  async findSportEventById(id: string): Promise<any> {
    console.log('find sportevent by id service (api) called');
    try {
      const sportEvent = await this.sportEventModel.findById(id);
      if (!sportEvent) {
        throw new HttpException('SportEvent not found', 404);
      }
      return sportEvent;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //deleting a sport event by id.
  async deleteSportEventById(_id: string): Promise<object> {
    console.log('delete sportevent by id service (api) called');
    try {
      const sportEvent = await this.sportEventModel
        .findByIdAndDelete(_id)
        .lean();

      if (!sportEvent) {
        throw new HttpException('SportEvent not found', 404);
      }
      await this.userModel
        .updateMany({}, { $pull: { enrolledSportEvents: _id } })
        .lean();
      return {
        statusCode: 200,
        message: `SportEvent ${sportEvent.title} deleted`,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //updating a sport event
  async updateSportEvent(sportEvent: SportEvent): Promise<object> {
    console.log('update sportevent by id service (api) called');
    try {
      const updatedSportEvent = await this.sportEventModel
        .findByIdAndUpdate(sportEvent._id, sportEvent, { new: true })
        .lean();
      if (!updatedSportEvent) {
        throw new HttpException('SportEvent not found', 404);
      }
      return {
        statusCode: 200,
        message: `SportEvent ${updatedSportEvent.title} updated`,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //enrolling a user to a sport event.
  async enrollUserToSportEvent(
    sportEventId: string,
    userId: string
  ): Promise<object> {
    console.log('enrollUserToSportEvent (api) called');
    try {
      const user: User = await this.userModel.findById(userId).lean();
      const sportEvent: SportEvent = await this.sportEventModel
        .findById(sportEventId)
        .lean();
      if (!user || !sportEvent) {
        throw new HttpException('User or sportEvent not found', 404);
      }
      if (
        sportEvent.enrolledParticipants.length >=
        sportEvent.maximumNumberOfParticipants
      ) {
        throw new HttpException('SportEvent is full', 400);
      }
      await this.sportEventModel.findByIdAndUpdate(
        sportEventId,
        { $addToSet: { enrolledParticipants: userId } },
        { new: true }
      );
      await this.userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { enrolledSportEvents: sportEventId } },
        { new: true }
      );
      //neo4j needs to be implemented here
      return {
        statusCode: 201,
        message: `User ${user.firstName} now is participating in  ${sportEvent.title}`,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //unenrolling a user from a sport event.
  async unenrollUserFromSportEvent(
    sportEventId: string,
    userId: string
  ): Promise<object> {
    console.log('unenrollUserToSportEvent (api) called');
    try {
      const user: User = await this.userModel.findById(userId).lean();
      const sportEvent: SportEvent = await this.sportEventModel
        .findById(sportEventId)
        .lean();
      if (!user || !sportEvent) {
        throw new HttpException('User or sportEvent not found', 404);
      }
      await this.sportEventModel.findByIdAndUpdate(
        sportEventId,
        { $pull: { enrolledParticipants: userId } },
        { new: true }
      );
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { enrolledSportEvents: sportEventId } },
        { new: true }
      );
      //neo4j needs to be implemented here
      return {
        statusCode: 201,
        message: `User ${user.firstName} is no longer participating in ${sportEvent.title}`,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}
