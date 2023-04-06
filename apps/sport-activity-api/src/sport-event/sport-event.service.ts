import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SportEvent, User } from '@sport-activity-app/domain';
import { Model } from 'mongoose';
import { SportEventDocument } from '../app/Schemas/sportEvent.schema';
import { UserDocument } from '../app/Schemas/user.schema';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class SportEventService {
  constructor(
    @InjectModel('SportEvent')
    private readonly sportEventModel: Model<SportEventDocument>,
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
    private readonly Neo4jService: Neo4jService
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

  ///////////////////////////////////////
  /////////////// CREATE   //////////////
  ///////////////////////////////////////

  //creating a sport event.
  async create(sportEvent: SportEvent): Promise<object> {
    console.log('create sportevent service (api) called');
    let createdSportEventInMongoDB: { mongoId: string; title: string };
    try {
      createdSportEventInMongoDB = await this.createEventInMongoDB(sportEvent);
      const createdSportEventInNeo4j = await this.createEventInNeo4j(
        createdSportEventInMongoDB.mongoId,
        createdSportEventInMongoDB.title
      );
      if (createdSportEventInNeo4j && createdSportEventInMongoDB) {
        return {
          statusCode: 201,
          message: `SportEvent ${sportEvent.title} created`,
        };
      }
    } catch (error) {
      if (createdSportEventInMongoDB) {
        await this.userModel
          .findByIdAndDelete(createdSportEventInMongoDB.mongoId)
          .lean();
      }
      throw new HttpException(error.message, 400);
    }
  }

  async createEventInMongoDB(
    sportEvent: SportEvent
  ): Promise<{ mongoId: string; title: string }> {
    console.log('create sportevent service (api) called (MongoDB)');
    try {
      const createdSportEvent = new this.sportEventModel(sportEvent);
      await createdSportEvent.save();
      const createdSportEventInMongoDB = {
        mongoId: createdSportEvent._id.toString(),
        title: createdSportEvent.title,
      };

      return createdSportEventInMongoDB;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async createEventInNeo4j(mongoId: string, title: string): Promise<boolean> {
    console.log('create sportevent service (api) called (Neo4j)');
    try {
      await this.Neo4jService.write(
        `CREATE (n:SportEvent {mongoId: "${mongoId}", Name: "${title}"})`
      );
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ///////////////////////////////////////
  ///////////////    GET     ////////////
  ///////////////////////////////////////

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

  ///////////////////////////////////////
  ///////////////    DELETE     /////////
  ///////////////////////////////////////

  //deleting a sport event by id.
  async deleteSportEventById(_id: string): Promise<object> {
    console.log('delete sportevent by id service (api) called');
    let mongoResult;
    let neo4jResult;
    try {
      mongoResult = this.deleteEventInMongoDB(_id);
      neo4jResult = this.deleteEventInNeo4j(_id);
      if (mongoResult && neo4jResult) {
        return {
          statusCode: 200,
          message: `SportEvent with id ${_id} deleted from MongoDB and Neo4j`,
        };
      }
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async deleteEventInMongoDB(_id: string): Promise<boolean> {
    console.log('delete sportevent service (api) called (MongoDB)');
    try {
      const sportEvent = await this.sportEventModel.findById(_id);
      if (!sportEvent) {
        throw new HttpException('SportEvent not found', 404);
      }

      await this.sportEventModel.findByIdAndDelete(_id).lean();

      await this.userModel
        .updateMany({}, { $pull: { enrolledSportEvents: _id } })
        .lean();
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async deleteEventInNeo4j(mongoId: string): Promise<boolean> {
    console.log('delete sportevent service (api) called (Neo4j)');
    try {
      await this.Neo4jService.write(
        `MATCH (n:SportEvent {mongoId: "${mongoId}"}) DETACH DELETE n`
      );
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ///////////////////////////////////////
  ///////////////    UPDATE     /////////
  ///////////////////////////////////////

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

  ///////////////////////////////////////
  ///////////////    ENROLL     /////////
  ///////////////////////////////////////

  //enrolling a user to a sport event.
  async enrollUserToSportEvent(
    sportEventId: string,
    userId: string
  ): Promise<object> {
    console.log('enrollUserToSportEvent (api) called');

    try {
      const enrolledUserToSportEventInMongoDB =
        await this.enrollUserToSportEventInMongoDB(sportEventId, userId);
      const enrolledUserToSportEventInNeo4j =
        await this.enrollUserToSportEventInNeo4j(sportEventId, userId);
      if (
        enrolledUserToSportEventInMongoDB &&
        enrolledUserToSportEventInNeo4j
      ) {
        return {
          statusCode: 201,
          message: `User with id ${userId} now is participating in sport event with id ${sportEventId}`,
        };
      }
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async enrollUserToSportEventInMongoDB(
    sportEventId: string,
    userId: string
  ): Promise<boolean> {
    console.log('enrollUserToSportEvent (api) called (MongoDB)');
    try {
      const user: User = await this.userModel.findById(userId).lean();
      const sportEvent: SportEvent = await this.sportEventModel
        .findById(sportEventId)
        .lean();

      //check if user and sportEvent exist
      if (!user || !sportEvent) {
        throw new HttpException('User or sportEvent not found', 404);
      }

      //check if sportEvent is full
      if (
        sportEvent.enrolledParticipants.length >=
        sportEvent.maximumNumberOfParticipants
      ) {
        throw new HttpException('SportEvent is full', 400);
      }

      //add user to sportEvent and sportEvent to user
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
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async enrollUserToSportEventInNeo4j(
    sportEventId: string,
    userId: string
  ): Promise<boolean> {
    console.log('enrollUserToSportEvent (api) called (Neo4j)');
    try {
      this.Neo4jService.write(
        `MATCH (n:User {mongoId: "${userId}"}) MATCH (m:SportEvent {mongoId: "${sportEventId}"}) CREATE (n)-[r:PARTICIPATES]->(m)`
      );
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ///////////////////////////////////////
  ///////////////    UNENROLL     ///////
  ///////////////////////////////////////

  //unenrolling a user from a sport event.
  async unenrollUserFromSportEvent(
    sportEventId: string,
    userId: string
  ): Promise<object> {
    console.log('unenrollUserToSportEvent (api) called');
    try {
      const unenrolledUserFromSportEventInMongoDB =
        await this.unenrollUserFromSportEventInMongoDB(sportEventId, userId);
      const unenrolledUserFromSportEventInNeo4j =
        await this.unenrollUserFromSportEventInNeo4j(sportEventId, userId);
      if (
        unenrolledUserFromSportEventInMongoDB &&
        unenrolledUserFromSportEventInNeo4j
      ) {
        return {
          statusCode: 201,
          message: `User with ${userId} is no longer participating in sport event with id ${sportEventId}`,
        };
      }
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async unenrollUserFromSportEventInMongoDB(
    sportEventId: string,
    userId: string
  ): Promise<boolean> {
    console.log('unenrollUserToSportEvent (api) called (MongoDB)');
    try {
      const user: User = await this.userModel.findById(userId).lean();
      const sportEvent: SportEvent = await this.sportEventModel
        .findById(sportEventId)
        .lean();
      if (!user || !sportEvent) {
        throw new HttpException('User or sportEvent not found', 404);
      }
      //remove user from sportEvent and sportEvent from user
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
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async unenrollUserFromSportEventInNeo4j(
    sportEventId: string,
    userId: string
  ): Promise<boolean> {
    console.log('unenrollUserToSportEvent (api) called (Neo4j)');
    try {
      this.Neo4jService.write(
        `MATCH (n:User {mongoId: "${userId}"}) MATCH (m:SportEvent {mongoId: "${sportEventId}"})
        MATCH (n)-[r:PARTICIPATES]->(m)
         DELETE r`
      );
      return true;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  //////////////////////////////////////////////////
  /////  GET all users enrolled SportEvents  //////
  ////////////////////////////////////////////////

  //get all sport events for a user
  async getAllUsersSportEvents(userId: string): Promise<object> {
    console.log('getAllUsersSportEvents (api) called');
    try {
      const user = await this.userModel.findById(userId).lean();
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      //get all sport events from MongoDB
      const sportEvents = await this.sportEventModel.find({
        _id: { $in: user.enrolledSportEvents },
      });

      return sportEvents;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ///////////////////////////////////////
  ////  Get Recommended SportEvents  ////
  ///////////////////////////////////////

  //get recommended sport events for a user
  async getRecommendedSportEvents(userId: string): Promise<object> {
    console.log('getRecommendedSportEvents (api) called');
    try {
      console.log(userId);

      //get recommended sport events from Neo4j
      const recommendedSportEvents = await this.Neo4jService.read(
        `MATCH (me:User)-[:FOLLOWS]->(following:User)-[:PARTICIPATES]->(event:SportEvent) WHERE me.mongoId = '${userId}' RETURN event LIMIT 10`
      );

      const mongoIds = [];
      for (const record of recommendedSportEvents.records) {
        const mongoId = record.get('event').properties.mongoId;
        mongoIds.push(mongoId);
      }

      const sportEvents = await this.sportEventModel.find({
        _id: { $in: mongoIds },
      });

      return sportEvents;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  ///////////////////////////////////////
  ////  Get hosting SportEvents  ///////
  ///////////////////////////////////////

  //get hosting sport events for a user
  async getHostedSportEvents(userId: string): Promise<object> {
    console.log('getHostingSportEvents (api) called');
    try {
      const user = await this.userModel.findById(userId).lean();
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      //get hosting sport events from MongoDB
      const sportEvents = await this.sportEventModel.find({
        hostId: userId,
      });

      return sportEvents;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}
