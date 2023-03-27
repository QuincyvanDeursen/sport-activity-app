import { Test, TestingModule } from '@nestjs/testing';
import { UserSchema } from '../../Schemas/user.schema';
import { UserService } from '../user.service';

import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SportEventSchema } from '../../Schemas/sportEvent.schema';
import { Role, User } from '@sport-activity-app/domain';
import { HttpException } from '@nestjs/common';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

//setup
export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      const mongoUri = mongod.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });

export const closeInMongodConnection = async () => {
  if (mongod) await mongod.stop();
};

//testing
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([
          { name: 'SportEvent', schema: SportEventSchema },
        ]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  ///////////////////////////////////////
  //////////// Create User /////////////
  /////////////////////////////////////

  it('should create a user', async () => {
    const user: User = {
      firstName: 'john',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'Secret123!',
      city: 'Breda',
      roles: [Role.User],
    };

    const result = await service.create(user);

    expect(result).toEqual({
      statusCode: 201,
      message: `User ${user.firstName} created`,
    });
  });

  it('should not create a user (no numbers allowed in firstname)', async () => {
    const user: User = {
      firstName: 'john2',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'Secret123!',
      city: 'Breda',
      roles: [Role.User],
    };
    try {
      await service.create(user);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('should not create a user (no numbers allowed in lastname)', async () => {
    const user: User = {
      firstName: 'john',
      lastName: 'Doe2',
      email: 'johndoe@example.com',
      password: 'Secret123!',
      city: 'Breda',
      roles: [Role.User],
    };
    try {
      await service.create(user);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('should not create a user (password missing a number)', async () => {
    const user: User = {
      firstName: 'john',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'Secret!',
      city: 'Breda',
      roles: [Role.User],
    };
    try {
      await service.create(user);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('should not create a user (password missing a special character)', async () => {
    const user: User = {
      firstName: 'john',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'Secret123',
      city: 'Breda',
      roles: [Role.User],
    };
    try {
      await service.create(user);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('should not create a user (email missing @)', async () => {
    const user: User = {
      firstName: 'john',
      lastName: 'Doe',
      email: 'johndoeexample.com',
      password: 'Secret123!',
      city: 'Breda',
      roles: [Role.User],
    };
    try {
      await service.create(user);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('should not create a user (email missing valid end)', async () => {
    const user: User = {
      firstName: 'john',
      lastName: 'Doe',
      email: 'johndoe@example',
      password: 'Secret123!',
      city: 'Breda',
      roles: [Role.User],
    };
    try {
      await service.create(user);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('should not create a user (email missing valid beginning)', async () => {
    const user: User = {
      firstName: 'john',
      lastName: 'Doe',
      email: '1@example.com',
      password: 'Secret123!',
      city: 'Breda',
      roles: [Role.User],
    };
    try {
      await service.create(user);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('should not create a user (duplicate email)', async () => {
    const user: User = {
      firstName: 'john',
      lastName: 'Doe',
      email: 'johndoe3@example.com',
      password: 'Secret123!',
      city: 'Breda',
      roles: [Role.User],
    };
    await service.create(user);

    const user2: User = {
      firstName: 'another',
      lastName: 'User',
      email: 'johndoe3@example.com',
      password: 'Secret123!',
      city: 'Breda',
      roles: [Role.User],
    };

    try {
      await service.create(user2);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toEqual(
        'Duplicate entry, email has to be unique.'
      );
    }
  });

  //////////////////////////////////
  /////////// Get all Users ///////
  ////////////////////////////////

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
