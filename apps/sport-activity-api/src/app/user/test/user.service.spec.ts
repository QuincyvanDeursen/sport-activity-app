import { Test } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, disconnect } from 'mongoose';
import { MongoClient } from 'mongodb';
import { UserService } from '../user.service';
import { User, UserDocument, UserSchema } from '../../Schemas/user.schema';
import {
  SportEvent,
  SportEventDocument,
  SportEventSchema,
} from '../../Schemas/sportEvent.schema';
import { Neo4jService } from 'nest-neo4j/dist';
import { HttpException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
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
        UserService,
        {
          provide: Neo4jService,
          useValue: { write: jest.fn(), read: jest.fn() },
        },
      ],
    }).compile();
    service = app.get<UserService>(UserService);
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
      _id: '64177204075a9a1a58d07a23',
      email: 'testuser@gmail.com',
      firstName: 'user',
      lastName: 'Doe',
      password: 'Secret123!',
      enrolledSportEvents: ['64177204075a9a1a58d07a55'],
      city: 'Berlin',
      roles: ['user'],
    });

    const user2 = new userModel({
      _id: '64177204075a9a1a58d07a24',
      email: 'testuser2@gmail.com',
      firstName: 'userr',
      lastName: 'Doe',
      password: 'Secret123!',
      city: 'Berlin',
      roles: ['user'],
    });

    const user3 = new userModel({
      _id: '64177204075a9a1a58d07a25',
      email: 'testuser3@gmail.com',
      firstName: 'userrr',
      lastName: 'Doe',
      password: 'Secret123!',
      city: 'Berlin',
      roles: ['admin'],
    });

    await Promise.all([user1.save(), user2.save(), user3.save()]);
  });

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  ///////////////////////////////////////////////////////////////////
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserInMongoDB', () => {
    ///////////////////////////////////////////////////////////////////
    it('should create a user in the database', async () => {
      const user = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: [],
      };

      const result = await service.createUserInMongoDB(user);

      expect(result.mongoId).toBeDefined();
      expect(result.firstName).toBe('john');
      expect(await userModel.findOne({ email: user.email })).toMatchObject({
        email: user.email.toLowerCase(),
        firstName: user.firstName.toLowerCase(),
        lastName: user.lastName.toLowerCase(),
      });
    });
    ///////////////////////////////////////////////////////////////////
    it('should throw an error if email is not unique', async () => {
      const user1 = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: [],
      };
      const user2 = {
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: [],
      };

      await service.createUserInMongoDB(user1);

      await expect(service.createUserInMongoDB(user2)).rejects.toThrow(
        new HttpException('Duplicate entry, email has to be unique.', 409)
      );
    });
  });

  describe('createUserInNeo4j', () => {
    ///////////////////////////////////////////////////////////////////
    it('should create a user in Neo4j', async () => {
      const result = await service.createUserInNeo4j('John Doe', '123456');
      expect(neo4jService.write).toBeCalledWith(
        'CREATE (n:User {mongoId: "123456", name: "John Doe"}) RETURN n'
      );
      expect(result).toBe(true);
    });
    ///////////////////////////////////////////////////////////////////
    it('should throw an error if Neo4j write fails', async () => {
      const errorMessage = 'Neo4j write error';
      (neo4jService.write as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      await expect(
        service.createUserInNeo4j('John Doe', '123456')
      ).rejects.toThrow(new HttpException(errorMessage, 400));
    });
  });

  describe('finding users', () => {
    ///////////////////////////////////////////////////////////////////
    it('should return http exception if user is not found', async () => {
      const email = 'test@example.com';
      try {
        await service.findUserByEmail(email);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
        expect(e.status).toBe(404);
      }
    });
    ///////////////////////////////////////////////////////////////////
    it('should return user with the given email', async () => {
      const email = 'testuser@gmail.com';
      const result = await service.findUserByEmail(email);
      expect(result.firstName).toBe('user');
      expect(result.email).toBe('testuser@gmail.com');
    });
    ///////////////////////////////////////////////////////////////////

    it('should throw HttpException if user is not found by id', async () => {
      const id = '64166666075a9a1a58d07a73';
      try {
        await service.findUserById(id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
        expect(e.status).toBe(404);
      }
    });

    ///////////////////////////////////////////////////////////////////
    it('should return the user if found by id', async () => {
      const result = await service.findUserById('64177204075a9a1a58d07a23');
      expect(result.firstName).toBe('user');
      expect(result.email).toBe('testuser@gmail.com');
    });

    ///////////////////////////////////////////////////////////////////
    it('should retrieve all users with role user', async () => {
      const results = await service.getAllUsers();

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.firstName)).toContain('user');
      expect(results.map((r) => r.firstName)).toContain('userr');
    });
  });

  describe('updating users', () => {
    ///////////////////////////////////////////////////////////////////
    it('should update user account settings', async () => {
      const userUpdate = new userModel({
        _id: '64177204075a9a1a58d07a23',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'Password123!',
        city: 'Berlin',
        roles: ['user'],
      });
      const result = await service.updateAccountSettings(userUpdate as User);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('statusCode', 200);
      expect(result).toHaveProperty(
        'message',
        `User with id: 64177204075a9a1a58d07a23 updated`
      );
    });
    ///////////////////////////////////////////////////////////////////
    it('should throw an error if user not found', async () => {
      const userUpdate = new userModel({
        _id: '64177204075a9a1238d07a23',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'Password123!',
        city: 'Berlin',
        roles: ['user'],
      });

      try {
        await service.updateAccountSettings(userUpdate as User);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
        expect(e.status).toBe(400);
      }
    });
    /////////////////////////////////////////////////////////////////
    it('should throw an error if email is duplicate', async () => {
      const userUpdate = new userModel({
        _id: '64177204075a9a1a58d07a23',
        firstName: 'John',
        lastName: 'Doe',
        email: 'testuser2@gmail.com',
        password: 'Password123!',
        city: 'Berlin',
        roles: ['user'],
      });

      try {
        await service.updateAccountSettings(userUpdate as User);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Duplicate entry, email has to be unique.');
        expect(e.status).toBe(409);
      }
    });
  });

  describe('deleting users', () => {
    ///////////////////////////////////////////////////////////////////
    it('should delete user', async () => {
      const result = await service.deleteUserInMongoDB(
        '64177204075a9a1a58d07a23'
      );
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
    });

    ///////////////////////////////////////////////////////////////////

    it('should throw an error if user not found', async () => {
      try {
        await service.deleteUserInMongoDB('64177204075a9a1238d07a23');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
        expect(e.status).toBe(400);
      }
    });

    ///////////////////////////////////////////////////////////////////
    it('should delete user in Neo4j', async () => {
      const result = await service.deleteUserInNeo4j('test');

      (neo4jService.write as jest.Mock).mockResolvedValueOnce(true);
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
    });

    ///////////////////////////////////////////////////////////////////
    it('should throw an error if user not found in Neo4j', async () => {
      try {
        await service.deleteUserInNeo4j('64177204075a9a1238d07a88');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Neo4j write error');
        expect(e.status).toBe(400);
      }
    });

    ///////////////////////////////////////////////////////////////////
    it('should delete all references to the user from sportevent', async () => {
      const user4 = new userModel({
        email: 'testuser4@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
      });
      const sportEvent1 = new sportEventModel({
        title: 'test',
        description: 'test',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        enrolledParticipants: [user4._id],
        hostId: '64177204075a5a1a58d07a55',
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

      await sportEvent1.save();
      await user4.save();

      const sportEvent = await sportEventModel.findById(sportEvent1._id).lean();
      expect(sportEvent).toBeDefined();
      expect(sportEvent).toHaveProperty('enrolledParticipants', [user4._id]);

      await service.deleteUserInMongoDB(user4._id.toString());
      const sportEvent2 = await sportEventModel
        .findById(sportEvent1._id)
        .lean();
      expect(sportEvent2).toBeDefined();
      expect(sportEvent2).toHaveProperty('enrolledParticipants', []);
    });
  });

  describe('following users', () => {
    ///////////////////////////////////////////////////////////////////
    it('should follow user and add id to array', async () => {
      const usertoFollow = new userModel({
        email: 'testuserfollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      const user = new userModel({
        email: 'testusertofollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      await usertoFollow.save();
      await user.save();

      const result = await service.followUserInMongoDB(
        user._id.toString(),
        usertoFollow._id.toString()
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('statusCode', 201);
      expect(result).toHaveProperty(
        'message',
        `User with id ${user._id} now follows user with id: ${usertoFollow._id}`
      );

      //check if user is added to followingUsers array
      const user2 = await userModel.findById(user._id).lean();
      expect(user2).toBeDefined();
      expect(user2).toHaveProperty('followingUsers', [usertoFollow._id]);
    });
    //////////////////////////////////////////////////////////////////////
    it('should give httpexception when trying to follow yourselfs', async () => {
      const usertoFollow = new userModel({
        email: 'testuserfollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });

      await usertoFollow.save();
      try {
        await service.followUserInMongoDB(
          usertoFollow._id.toString(),
          usertoFollow._id.toString()
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('You cannot follow yourself');
        expect(e.status).toBe(400);
      }
    });

    //////////////////////////////////////////////////////////////////////
    it('should give httpexception when trying to follow a user that does not exist', async () => {
      const usertoFollow = new userModel({
        email: 'testuserfollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      await usertoFollow.save();
      try {
        await service.followUserInMongoDB(
          usertoFollow._id.toString(),
          '64177204775a5a1a58d07a55'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User to follow not found');
        expect(e.status).toBe(404);
      }
    });

    //////////////////////////////////////////////////////////////////////
    it('should give httpexception when trying current user does not exist', async () => {
      const userToFollow = new userModel({
        email: 'testuserfollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      await userToFollow.save();
      try {
        await service.followUserInMongoDB(
          '64177204775a5a1a58d87a55',
          userToFollow._id.toString()
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('currentUser not found');
        expect(e.status).toBe(404);
      }
    });

    //////////////////////////////////////////////////////////////////////
    it('should return true when neo4j write for following is successful', async () => {
      const userCurrent = new userModel({
        email: 'testuserfollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      const userToFollow = new userModel({
        email: 'testusertofollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      await userCurrent.save();
      await userToFollow.save();

      const result = await service.followUserInNeo4j(
        userCurrent._id.toString(),
        userToFollow._id.toString()
      );

      expect(result).toBeDefined();
      expect(result).toBe(true);
    });
  });

  describe('unfollowing users', () => {
    ///////////////////////////////////////////////////////////////////
    it('should unfollow user and remove referenice id of user', async () => {
      const userToUnFollow = new userModel({
        email: 'testusertofollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['admin'],
        followingUsers: [],
      });

      await userToUnFollow.save();

      const userCurrent = new userModel({
        email: 'testuserfollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['admin'],
        followingUsers: [userToUnFollow._id],
      });
      await userCurrent.save();

      const result = await service.unfollowUserInMongoDB(
        userCurrent._id.toString(),
        userToUnFollow._id.toString()
      );
      expect(result).toBeDefined();
      expect(result).toBeTruthy();

      //check if user is removed from followingUsers array
      const user2 = await userModel.findById(userCurrent._id).lean();
      expect(user2).toBeDefined();
      expect(user2).toHaveProperty('followingUsers', []);
    });

    //////////////////////////////////////////////////////////////////////
    it('should give httpexception when trying to unfollow a user that does not exist', async () => {
      const userCurrent = new userModel({
        email: 'testuserfollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      await userCurrent.save();
      try {
        await service.unfollowUserInMongoDB(
          userCurrent._id.toString(),
          '64177204775a5a1a58d07a55'
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User to unfollow not found');
        expect(e.status).toBe(400);
      }
    });

    //////////////////////////////////////////////////////////////////////
    it('should return true if neo4j write for unfollowing is successful', async () => {
      const userCurrent = new userModel({
        email: 'testuserfollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      const userToFollow = new userModel({
        email: 'testusertofollow@gmail.com',
        firstName: 'userrr',
        lastName: 'Doe',
        password: 'Secret123!',
        city: 'Berlin',
        roles: ['user'],
        followingUsers: [],
      });
      await userCurrent.save();
      await userToFollow.save();

      const result = await service.followUserInNeo4j(
        userCurrent._id.toString(),
        userToFollow._id.toString()
      );

      expect(result).toBeDefined();
      expect(result).toBe(true);
    });
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });
});
