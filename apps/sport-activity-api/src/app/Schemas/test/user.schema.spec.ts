import { Model, disconnect } from 'mongoose';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserDocument, UserSchema } from '../user.schema';
import { Test } from '@nestjs/testing';

describe('User schema test', () => {
  let mongod: MongoMemoryServer;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            return { uri };
          },
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
    }).compile();

    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  });

  describe('email', () => {
    it('should fail validation when email is missing', async () => {
      const user = new userModel({
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: [],
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation when email is invalid', async () => {
      const user = new userModel({
        email: 'invalid_email_address',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: [],
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should pass validation when email is valid', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: [],
      });
      await expect(user.validate()).resolves.not.toThrow();
    });
  });

  describe('password', () => {
    it('should fail validation when password is missing', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: [],
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation when password is too short', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'Pass1!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: ['user'],
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation when password does not contain a lowercase letter', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'PASSWORD123!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: ['user'],
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation when password does not contain an uppercase letter', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'password123!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: ['user'],
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation when password does not contain a number', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'Password!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: ['user'],
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation when password does not contain a special character', async () => {
      const user = new userModel({
        email: 'john.doe@exmaple.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: ['user'],
      });
      await expect(user.validate()).rejects.toThrow();
    });

    it('should pass validation when password is valid', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: ['user'],
      });

      await expect(user.validate()).resolves.not.toThrow();
    });
  });

  describe('firstName & lastname', () => {
    it('should fail validation when firstName is missing', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'Password123!',
        lastName: 'Doe',
        city: 'Breda',
        roles: ['user'],
      });

      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation when lastName is missing', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'Password123!',
        firstName: 'John',
        city: 'Breda',
        roles: ['user'],
      });

      await expect(user.validate()).rejects.toThrow();
    });

    it('should pass validation when firstName and lastName are present', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Breda',
        roles: ['user'],
      });

      await expect(user.validate()).resolves.not.toThrow();
    });

    it('should fail validation when firstName contains numbers', async () => {
      const user = new userModel({
        firstname: 'John123',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        city: 'Breda',
        roles: ['user'],
      });

      await expect(user.validate()).rejects.toThrow();
    });

    it('should fail validation when lastName contains numbers', async () => {
      const user = new userModel({
        firstname: 'John',
        lastname: 'Doe123',
        email: 'john.doe@example.com',
        city: 'Breda',
        roles: ['user'],
      });

      await expect(user.validate()).rejects.toThrow();
    });
  });

  describe('city', () => {
    it('should fail validation when city is missing', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        roles: ['user'],
      });

      await expect(user.validate()).rejects.toThrow();
    });

    it('should pass validation when city is present (spaces and - allowed', async () => {
      const user = new userModel({
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        city: 'Breda - test',
        roles: ['user'],
      });

      await expect(user.validate()).resolves.not.toThrow();
    });

    it('should fail validation when city contains numbers', async () => {
      const user = new userModel({
        email: 'john.doe.example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        city: 'Breda123',
        roles: ['user'],
      });

      await expect(user.validate()).rejects.toThrow();
    });
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(userModel).toBeDefined();
  });
});
