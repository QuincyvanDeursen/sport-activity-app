import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  Sportclub,
  SportclubDocument,
  SportclubSchema,
} from '../sportclub.schema';

describe('Sportclub schema test', () => {
  let sportClubModel: Model<SportclubDocument>;
  let mongod: MongoMemoryServer;
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
        MongooseModule.forFeature([
          { name: Sportclub.name, schema: SportclubSchema },
        ]),
      ],
    }).compile();

    sportClubModel = app.get<Model<SportclubDocument>>(
      getModelToken(Sportclub.name)
    );
  });

  describe('required', () => {
    it('clubname should be required', async () => {
      const sportclub = new sportClubModel({
        websiteURL: 'https://www.test.com',
        email: 'test@gmail.com',
        phoneNumber: '123456789',
        address: {
          city: 'city',
          zipCode: '1234AB',
          street: 'street',
          houseNumber: '1',
        },
      });
      await expect(sportclub.validate()).rejects.toThrow();
    });

    it('email should be required', async () => {
      const sportclub = new sportClubModel({
        websiteURL: 'https://www.test.com',
        clubName: 'clubname',
        phoneNumber: '123456789',
        address: {
          city: 'city',
          zipCode: '1234AB',
          street: 'street',
          houseNumber: '1',
        },
      });
      await expect(sportclub.validate()).rejects.toThrow();
    });

    it('websiteURL should be required', async () => {
      const sportclub = new sportClubModel({
        clubName: 'clubname',
        email: 'test@gmail.com',
        phoneNumber: '123456789',
        address: {
          city: 'city',
          zipCode: '1234AB',
          street: 'street',
          houseNumber: '1',
        },
      });
      await expect(sportclub.validate()).rejects.toThrow();
    });

    it('phoneNumber should be required', async () => {
      const sportclub = new sportClubModel({
        websiteURL: 'https://www.test.com',
        clubName: 'clubname',
        email: 'test@gmail.com',
        address: {
          city: 'city',
          zipCode: '1234AB',
          street: 'street',
          houseNumber: '1',
        },
      });
      await expect(sportclub.validate()).rejects.toThrow();
    });

    it('address should be required', async () => {
      const sportclub = new sportClubModel({
        websiteURL: 'https://www.test.com',
        clubName: 'clubname',
        email: 'test@gmail.com',
        phoneNumber: '123456789',
      });
      await expect(sportclub.validate()).rejects.toThrow();
    });
  });

  describe('website url', () => {
    it('Should fail when websiteUrl is not valid.', async () => {
      const sportclub = new sportClubModel({
        websiteURL: 'test',
        clubName: 'clubname',
        email: 'test@gmail.com',
        phoneNumber: '123456789',
        address: {
          city: 'city',
          zipCode: '1234AB',
          street: 'street',
          houseNumber: '1',
        },
      });
      await expect(sportclub.validate()).rejects.toThrow();
    });

    it('Should pas when website url is valid', async () => {
      const sportclub = new sportClubModel({
        websiteURL: 'https://www.test.com',
        clubName: 'clubname',
        email: 'test@gmail.com',
        phoneNumber: '123456789',
        address: {
          city: 'city',
          zipCode: '1234AB',
          street: 'street',
          houseNumber: '1',
        },
      });
      await expect(sportclub.validate()).resolves.not.toThrow();
    });
  });

  describe('email', () => {
    it('Should fail when email is not valid.', async () => {
      const sportclub = new sportClubModel({
        websiteURL: 'https://www.test.com',
        clubName: 'clubname',
        email: 'test',
        phoneNumber: '123456789',
        address: {
          city: 'city',
          zipCode: '1234AB',
          street: 'street',
          houseNumber: '1',
        },
      });
      await expect(sportclub.validate()).rejects.toThrow();
    });

    it('Should pas when email is valid', async () => {
      const sportclub = new sportClubModel({
        websiteURL: 'https://www.test.com',
        clubName: 'clubname',
        email: 'john.doe@example.com',
        phoneNumber: '123456789',
        address: {
          city: 'city',
          zipCode: '1234AB',
          street: 'street',
          houseNumber: '1',
        },
      });
      await expect(sportclub.validate()).resolves.not.toThrow();
    });
  });

  afterAll(async () => {
    await sportClubModel.deleteMany({});
    await mongod.stop();
  });
});
