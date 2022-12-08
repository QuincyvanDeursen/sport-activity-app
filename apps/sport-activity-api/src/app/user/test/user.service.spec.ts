import { Test } from '@nestjs/testing';
import { UserService } from '../user.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { disconnect } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

import { Role, User } from '@sport-activity-app/domain';
import { UserSchema } from '../../Schemas/user.schema';
import { HttpException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mongod: MongoMemoryServer;
  let mongoc: MongoClient;
  let uri;
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
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      providers: [UserService],
    }).compile();

    service = app.get<UserService>(UserService);
    mongoc = new MongoClient(uri);
    await mongoc.connect();
  });

  beforeEach(async () => {
    await mongoc.db('test').collection('users').deleteMany({});
  });

  afterAll(async () => {
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  it('should be defined', () => {
    console.log(uri);
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUser: User = {
        email: 'testuser@gmail.com',
        password: 'testpassword',
        firstName: 'testfirstname',
        lastName: 'testlastname',
        city: 'testcity',
        roles: [Role.User],
      };

      const result = await service.create(mockUser);
      const found = await mongoc
        .db('test')
        .collection('users')
        .findOne({ email: mockUser.email });
      expect(found.email).toBe(mockUser.email);
      expect(result).toEqual({
        statusCode: 201,
        message: `User ${mockUser.firstName} created`,
      });
    });

    it('should create a new employee', async () => {
      const mockUser: User = {
        email: 'testuser@gmail.com',
        password: 'testpassword',
        firstName: 'testfirstname',
        lastName: 'testlastname',
        city: 'testcity',
        roles: [Role.Employee],
        sportclub: {
          clubName: 'testclubname',
          websiteURL: 'testwebsiteurl',
          email: 'testemail@gmail.com',
          phoneNumber: 'testphone',
          address: {
            street: 'teststreet',
            city: 'testcity',
            zipCode: 'testzipcode',
            houseNumber: 'testhousenumber',
          },
        },
      };

      const result = await service.create(mockUser);
      const found = await mongoc
        .db('test')
        .collection('users')
        .findOne({ email: mockUser.email });
      expect(found.email).toBe(mockUser.email);
      expect(result).toEqual({
        statusCode: 201,
        message: `User ${mockUser.firstName} created`,
      });
    });

    it('should not create a new user', async () => {
      const mockUser: User = {
        email: 'testuser@gmail.com',
        password: 'testpassword',
        firstName: 'testfirstname',
        lastName: 'testlastname',
        city: 'testcity',
        roles: [Role.User],
      };
      const mockUser2: User = {
        email: 'testuser@gmail.com',
        password: 'test2password',
        firstName: 'test2firstname',
        lastName: 'test2lastname',
        city: 'test2city',
        roles: [Role.User],
      };

      await service.create(mockUser);
      try {
        await service.create(mockUser2);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toEqual('Duplicate entry, email has to be unique.');
        expect(e.status).toEqual(409);
      }
    });
  });
});
