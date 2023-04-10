import { Test } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, Schema, disconnect } from 'mongoose';
import { MongoClient } from 'mongodb';

import { Neo4jService } from 'nest-neo4j/dist';
import { SportEventService } from '../sport-event.service';
import { User, UserDocument, UserSchema } from '../../app/Schemas/user.schema';
import { SportEvent as SportEventInterface } from '@sport-activity-app/domain';

import {
  SportEvent,
  SportEventDocument,
  SportEventSchema,
} from '../../app/Schemas/sportEvent.schema';
import { HttpException } from '@nestjs/common';
import exp = require('constants');
import { find } from 'rxjs';

describe('SportEventService', () => {
  let service: SportEventService;
  let neo4jService: Neo4jService;
  let mongod: MongoMemoryServer;
  let mongoc: MongoClient;
  let userModel: Model<UserDocument>;
  let sportEventModel: Model<SportEventDocument>;

  beforeAll(async () => {
    let uri: string;

    const app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            return { uri };
          },
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
          { name: SportEvent.name, schema: SportEventSchema },
        ]),
      ],
      providers: [
        SportEventService,
        {
          provide: Neo4jService,
          useValue: { write: jest.fn(), read: jest.fn() },
        },
      ],
    }).compile();
    service = app.get<SportEventService>(SportEventService);
    neo4jService = app.get<Neo4jService>(Neo4jService);
    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    sportEventModel = app.get<Model<SportEventDocument>>(
      getModelToken(SportEvent.name)
    );

    mongoc = new MongoClient(uri);
    await mongoc.connect();
  });

  beforeEach(async () => {
    const user1 = new userModel({
      email: 'testuser1@gmail.com',
      firstName: 'user',
      lastName: 'Doe',
      password: 'Secret123!',
      enrolledSportEvents: [],
      city: 'Berlin',
      roles: ['user'],
    });
    const date = new Date();
    const tommorow = date.setDate(date.getDate() + 1);
    const sportEvent1 = new sportEventModel({
      _id: '64177204075a9a1a58d07a55',
      title: 'test',
      description: 'test',
      price: 10,
      startDateAndTime: tommorow,
      durationInMinutes: 60,
      maximumNumberOfParticipants: 10,
      enrolledParticipants: [user1._id],
      hostId: '64177204075a5a1a58d07a88',
      sportclub: {
        _id: '64177274075a9a1a58d07a55',
        clubName: 'test',
        websiteURL: 'https://www.test.com',
        email: 'test@gmail.com',
        phoneNumber: '123456789',
        address: {
          street: 'test',
          houseNumber: '1',
          zipCode: '12345',
          city: 'test',
        },
      },
    });
    const date2 = new Date();
    const yesterday = date.setDate(date2.getDate() - 1);
    const sportEvent2 = new sportEventModel({
      title: 'test',
      description: 'test',
      price: 10,
      startDateAndTime: yesterday,
      durationInMinutes: 60,
      maximumNumberOfParticipants: 10,
      enrolledParticipants: [],
      hostId: '64177204075a5a1a58d07a55',
      sportclub: {
        _id: '64177274075a9a1a58d07a54',
        clubName: 'test',
        websiteURL: 'https://www.test.com',
        email: 'test@gmail.com',
        phoneNumber: '123456789',
        address: {
          street: 'test',
          houseNumber: '1',
          zipCode: '12345',
          city: 'test',
        },
      },
    });

    const user2 = new userModel({
      _id: '64177204075a9a1a58d07a23',
      email: 'testuser2@gmail.com',
      firstName: 'user',
      lastName: 'Doe',
      password: 'Secret123!',
      enrolledSportEvents: [sportEvent2.id],
      city: 'Berlin',
      roles: ['user'],
    });

    const user3 = new userModel({
      _id: '64177204075a5a1a58d07a88',
      email: 'testuser3@gmail.com',
      firstName: 'user',
      lastName: 'Doe',
      password: 'Secret123!',
      enrolledSportEvents: [],
      city: 'Berlin',
      roles: ['user'],
    });

    await Promise.all([
      user1.save(),
      sportEvent1.save(),
      user2.save(),
      sportEvent2.save(),
      user3.save(),
    ]);
  });

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await sportEventModel.deleteMany({});
    await userModel.deleteMany({});
  });

  ///////////////////////////////////////////////////////////////////
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  describe('create event in mongoDb', () => {
    /////////////////////////////////////////////
    it('should create a new event', async () => {
      const sportEvent1: SportEventInterface = {
        title: 'test',
        description: 'test',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        hostId: '64177204075a5a1a58d07a55',
        sportclub: {
          clubName: 'test',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            street: 'test',
            houseNumber: '1',
            zipCode: '12345',
            city: 'test',
          },
        },
      };

      const result = await service.createEventInMongoDB(sportEvent1);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('mongoId');
      expect(result).toHaveProperty('hostId');
    });
  });

  describe('create event in neo4j', () => {
    /////////////////////////////////////////////
    it('should create an event in Neo4j', async () => {
      const hostId = new Schema.Types.ObjectId('64177204075a5a1a58d07a88');
      const result = await service.createEventInNeo4j('123456', hostId);
      expect(neo4jService.write).toBeCalledWith(
        `CREATE (n:SportEvent {mongoId: "123456", hostId: "${hostId}"})`
      );
      expect(result).toBe(true);
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw an error if Neo4j write fails', async () => {
      const hostId = new Schema.Types.ObjectId('64177204075a5a1a58d07a88');
      const errorMessage = 'Neo4j write error';
      (neo4jService.write as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      await expect(
        service.createEventInNeo4j('123456', hostId)
      ).rejects.toThrow(new HttpException(errorMessage, 400));
    });
  });

  describe('find sport events', () => {
    /////////////////////////////////////////////
    it('should find all future sport events', async () => {
      const result = await service.getAllSportEvents();
      expect(result).toHaveLength(1);
      expect(result[0].title).toEqual('test');
    });

    ///////////////////////////////////////////////////////////////////
    it('should return sport events by id', async () => {
      const result = await service.findSportEventById(
        '64177204075a9a1a58d07a55'
      );
      expect(result).toBeDefined();
      expect(result.title).toEqual('test');
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when events is not found by id', async () => {
      try {
        await service.findSportEventById('64177204075a9a1a58d07a66');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('SportEvent not found');
        expect(e.status).toBe(400);
      }
    });

    ///////////////////////////////////////////////////////////////////
    it('should return hosts events', async () => {
      const result = await service.getHostedSportEvents(
        '64177204075a5a1a58d07a88'
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toEqual('test');
    });

    ///////////////////////////////////////////////////////////////////
    it('should return error when host is not found', async () => {
      try {
        await service.getHostedSportEvents('64177204075a5a1a58d07a99');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
        expect(e.status).toBe(400);
      }
    });

    ///////////////////////////////////////////////////////////////////
    it('should return recommended sport events for a user', async () => {
      const userId = '123';

      // Mock data for Neo4j service response
      const mockRecommendedSportEvents = {
        records: [
          {
            get: (property: string) => {
              return {
                properties: {
                  mongoId: '123456',
                },
              };
            },
          },
        ],
      };
      // Mock the read method of Neo4jService to return mockRecommendedSportEvents
      (neo4jService.read as jest.Mock).mockResolvedValueOnce(
        mockRecommendedSportEvents
      );

      // Mock data for MongoDB find response
      const mockSportEvents = [
        { _id: '123456', name: 'Mock SportEvent 1' },
        { _id: '789012', name: 'Mock SportEvent 2' },
      ];
      // Mock the find method of SportEventModel to return mockSportEvents
      jest
        .spyOn(sportEventModel, 'find')
        .mockResolvedValueOnce(mockSportEvents);

      // Call the method and expect it to return the mockSportEvents
      const result = await service.getRecommendedSportEvents(userId);
      expect(result).toEqual(mockSportEvents);

      // Assert that Neo4jService read method was called with the expected parameter
      expect(neo4jService.read).toHaveBeenCalledWith(
        "MATCH (me:User)-[:FOLLOWS]->(following:User)-[:PARTICIPATES]->(event:SportEvent) WHERE me.mongoId = '123' RETURN event LIMIT 10"
      );

      // Assert that SportEventModel find method was called with the expected parameter
      expect(sportEventModel.find).toHaveBeenCalledWith({
        _id: { $in: ['123456'] },
      });
    });

    it('should throw HttpException when Neo4jService throws error', async () => {
      const userId = '123';

      // Mock error for Neo4j service
      const mockError = new Error('Mock Neo4j Error');
      (neo4jService.read as jest.Mock).mockRejectedValueOnce(mockError);

      // Expect the method to throw an HttpException with the error message
      await expect(service.getRecommendedSportEvents(userId)).rejects.toThrow(
        new HttpException(mockError.message, 400)
      );
    });

    ///////////////////////////////////////////////////////////////////
    it('should return users sport events', async () => {
      const result = await service.getAllUsersSportEvents(
        '64177204075a9a1a58d07a23'
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toEqual('test');
    });

    ///////////////////////////////////////////////////////////////////
    it('should return error when user is not found', async () => {
      try {
        await service.getAllUsersSportEvents('64177204075a9a1a58d07a66');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
        expect(e.status).toBe(400);
      }
    });
  });

  describe('delete sportevents by id in mongoose', () => {
    ///////////////////////////////////////////////////////////////////
    it('should delete sport event by id', async () => {
      const result = await service.deleteEventInMongoDB(
        '64177204075a9a1a58d07a55'
      );
      expect(result).toBe(true);
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when event is not found', async () => {
      try {
        await service.deleteEventInMongoDB('64177204075a9a1a58d07a66');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('SportEvent not found');
        expect(e.status).toBe(400);
      }
    });
  });

  describe('delete sportevents by id in neo4j', () => {
    ///////////////////////////////////////////////////////////////////
    it('should delete sport event by id', async () => {
      const result = await service.deleteEventInNeo4j(
        '64177204075a9a1a58d07a55'
      );
      expect(neo4jService.write).toHaveBeenCalledWith(
        `MATCH (n:SportEvent {mongoId: "64177204075a9a1a58d07a55"}) DETACH DELETE n`
      );
      expect(result).toBe(true);
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when event is not found', async () => {
      try {
        await service.deleteEventInNeo4j('64177204075a9a1a58d07a66');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('SportEvent not found');
        expect(e.status).toBe(400);
      }
    });
  });

  describe('update sportevent', () => {
    ///////////////////////////////////////////////////////////////////
    it('should update sport event', async () => {
      const sportEventupdate: SportEventInterface = {
        _id: '64177204075a9a1a58d07a55',
        title: 'geupdate',
        description: 'test',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        enrolledParticipants: [],
        hostId: '64177204075a5a1a58d07a88',
        sportclub: {
          clubName: 'test',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            street: 'test',
            houseNumber: '1',
            zipCode: '12345',
            city: 'test',
          },
        },
      };
      const result = await service.updateSportEvent(sportEventupdate);
      const updatedEvent = await sportEventModel.findById(
        '64177204075a9a1a58d07a55'
      );

      expect(updatedEvent.title).toEqual('geupdate');
      expect(result).toHaveProperty('statusCode', 200);
      expect(result).toHaveProperty('message', 'SportEvent geupdate updated');
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when event is not found', async () => {
      try {
        const sportEventupdate: SportEventInterface = {
          _id: '64177204075a9a1a58d07a66',
          title: 'geupdate',
          description: 'test',
          price: 10,
          startDateAndTime: new Date(),
          durationInMinutes: 60,
          maximumNumberOfParticipants: 10,
          enrolledParticipants: [],
          hostId: '64177204075a5a1a58d07a88',
          sportclub: {
            clubName: 'test',
            websiteURL: 'https://www.test.com',
            email: 'test@gmail.com',
            phoneNumber: '123456789',
            address: {
              street: 'test',
              houseNumber: '1',
              zipCode: '12345',
              city: 'test',
            },
          },
        };
        await service.updateSportEvent(sportEventupdate);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('SportEvent not found');
        expect(e.status).toBe(400);
      }
    });
  });

  describe('enrolling a user', () => {
    ///////////////////////////////////////////////////////////////////
    it('should enroll a user', async () => {
      const result = await service.enrollUserToSportEvent(
        '64177204075a9a1a58d07a55',
        '64177204075a5a1a58d07a88'
      );

      expect(result).toHaveProperty('statusCode', 201);
      expect(result).toHaveProperty(
        'message',
        'User with id 64177204075a5a1a58d07a88 now is participating in sport event with id 64177204075a9a1a58d07a55'
      );

      const updatedEvent = await sportEventModel.findById(
        '64177204075a9a1a58d07a55'
      );
      //already contains a user, hence 2
      expect(updatedEvent.enrolledParticipants).toHaveLength(2);
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when event is not found', async () => {
      try {
        await service.enrollUserToSportEvent(
          '64177204075a9a1a58d07a66',
          '64177204075a5a1a58d07a88'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User or sportEvent not found');
        expect(e.status).toBe(400);
      }
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when user is not found', async () => {
      try {
        await service.enrollUserToSportEvent(
          '64177204075a9a1a58d07a55',
          '64177204075a5a1a58d07a66'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User or sportEvent not found');
        expect(e.status).toBe(400);
      }
    });
  });
  describe('enroll user in neo4j', () => {
    ///////////////////////////////////////////////////////////////////
    it('should enroll a user', async () => {
      await service.enrollUserToSportEventInNeo4j(
        '64177204075a9a1a58d07a55',
        '64177204075a5a1a58d07a88'
      );
      expect(neo4jService.write).toHaveBeenCalledWith(
        'MATCH (n:User {mongoId: "64177204075a5a1a58d07a88"}) MATCH (m:SportEvent {mongoId: "64177204075a9a1a58d07a55"}) CREATE (n)-[r:PARTICIPATES]->(m)'
      );
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when event is not found', async () => {
      try {
        await service.enrollUserToSportEventInNeo4j(
          '64177204075a9a1a58d07a66',
          '64177204075a5a1a58d07a88'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User or sportEvent not found');
        expect(e.status).toBe(400);
      }
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when user is not found', async () => {
      try {
        await service.enrollUserToSportEventInNeo4j(
          '64177204075a9a1a58d07a55',
          '64177204075a5a1a58d07a66'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User or sportEvent not found');
        expect(e.status).toBe(400);
      }
    });
  });

  describe('uneroll from sportevent', () => {
    ///////////////////////////////////////////////////////////////////
    it('should uneroll a user from neo4j', async () => {
      const result = await service.enrollUserToSportEventInNeo4j(
        '64177204075a9a1a58d07a55',
        '64177204075a5a1a58d07a88'
      );

      expect(result).toBeTruthy();
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when event is not found', async () => {
      try {
        await service.enrollUserToSportEventInNeo4j(
          '64177204075a9a1a58d07a66',
          '64177204075a5a1a58d07a88'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User or sportEvent not found');
        expect(e.status).toBe(400);
      }
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when user is not found', async () => {
      try {
        await service.enrollUserToSportEventInMongoDB(
          '64177204075a9a1a58d07a55',
          '64177204075a5a1a58d07a66'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User or sportEvent not found');
        expect(e.status).toBe(400);
      }
    });

    ///////////////////////////////////////////////////////////////////

    it('should uneroll a user from mongo', async () => {
      const result = await service.unenrollUserFromSportEventInMongoDB(
        '64177204075a9a1a58d07a55',
        '64177204075a9a1a58d07a23'
      );

      const updatedEvent = await sportEventModel.findById(
        '64177204075a9a1a58d07a55'
      );
      const updatedUser = await userModel.findById('64177204075a9a1a58d07a23');

      expect(updatedUser.enrolledSportEvents).toHaveLength(1);
      expect(updatedEvent.enrolledParticipants).toHaveLength(1);

      expect(result).toBeTruthy();
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw error when event is not found', async () => {
      try {
        await service.unenrollUserFromSportEvent(
          '64177204075a9a1a58d07a66',
          '64177204075a5a1a58d07a88'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User or sportEvent not found');
        expect(e.status).toBe(400);
      }
    });
  });
  ///////////////////////////////////////////////////////////////////
});
