import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import mongoose, { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  SportEvent,
  SportEventDocument,
  SportEventSchema,
} from '../sportEvent.schema';

describe('sportevent schema test', () => {
  let sportEventModel: Model<SportEventDocument>;
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
          { name: SportEvent.name, schema: SportEventSchema },
        ]),
      ],
    }).compile();

    sportEventModel = app.get<Model<SportEventDocument>>(
      getModelToken(SportEvent.name)
    );
  });

  describe('Sport Event Model', () => {
    it('should throw an error if maximumNumberOfParticipants is less than 1', async () => {
      const sportEvent = new sportEventModel({
        title: 'title',
        description: 'description',
        price: 10,
        startDateAndTime: new Date(),
        sportclub: {
          clubName: 'name',
          websiteURL: 'www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            city: 'city',
            zipCode: '1234AB',
            street: 'street',
            houseNumber: '1',
          },
        },
        durationInMinutes: 60,
        maximumNumberOfParticipants: 0, // set to an invalid value
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });

      // Validate the sportEvent object and expect it to reject with a validation error
      await expect(sportEvent.validate()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it('should allow maximumNumberOfParticipants to be 1 or greater', async () => {
      const sportEvent = new sportEventModel({
        title: 'title',
        description: 'description',
        price: 10,
        startDateAndTime: new Date(),
        sportclub: {
          clubName: 'name',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            city: 'city',
            zipCode: '1234AB',
            street: 'street',
            houseNumber: '1',
          },
        },
        durationInMinutes: 60,
        maximumNumberOfParticipants: 1, // set to a valid value
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });

      // Validate the sportEvent object and expect it to resolve without throwing an error
      await expect(sportEvent.validate()).resolves.not.toThrow();
    });

    it('should throw an error if durationInMinutes is less than 0', async () => {
      const sportEvent = new sportEventModel({
        title: 'title',
        description: 'description',
        price: 10,
        startDateAndTime: new Date(),
        sportclub: {
          clubName: 'name',
          websiteURL: 'http://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            city: 'city',
            zipCode: '1234AB',
            street: 'street',
            houseNumber: '1',
          },
        },
        durationInMinutes: -1, // set to an invalid value
        maximumNumberOfParticipants: 10,
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });

      // Validate the sportEvent object and expect it to reject with a validation error
      await expect(sportEvent.validate()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it('should allow durationInMinutes to be 0 or greater', async () => {
      const sportEvent = new sportEventModel({
        title: 'title',
        description: 'description',
        price: 10,
        startDateAndTime: new Date(),
        sportclub: {
          clubName: 'name',
          websiteURL: 'http://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            city: 'city',
            zipCode: '1234AB',
            street: 'street',
            houseNumber: '1',
          },
        },
        durationInMinutes: 0, // set to a valid value
        maximumNumberOfParticipants: 10,
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });

      // Validate the sportEvent object and expect it to resolve without throwing an error
      await expect(sportEvent.validate()).resolves.not.toThrow();
    });
  });

  describe('required', () => {
    //required
    it('title should be required', async () => {
      const sportEvent = new sportEventModel({
        description: 'description',
        price: 10,
        startDateAndTime: new Date(),
        sportclub: {
          clubName: 'name',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            city: 'city',
            zipCode: '1234AB',
            street: 'street',
            houseNumber: '1',
          },
        },
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });
      await expect(sportEvent.validate()).rejects.toThrow();
    });

    it('title should be required', async () => {
      const sportEvent = new sportEventModel({
        description: 'description',
        price: 10,
        startDateAndTime: new Date(),
        sportclub: {
          clubName: 'name',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            city: 'city',
            zipCode: '1234AB',
            street: 'street',
            houseNumber: '1',
          },
        },
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });
      await expect(sportEvent.validate()).rejects.toThrow();
    });

    it('price should be required', async () => {
      const sportEvent = new sportEventModel({
        title: 'title',
        description: 'description',
        startDateAndTime: new Date(),
        sportclub: {
          clubName: 'name',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            city: 'city',
            zipCode: '1234AB',
            street: 'street',
            houseNumber: '1',
          },
        },
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });
      await expect(sportEvent.validate()).rejects.toThrow();
    });

    it('description should be required', async () => {
      const sportEvent = new sportEventModel({
        title: 'title',
        price: 10,
        startDateAndTime: new Date(),
        sportclub: {
          clubName: 'name',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            city: 'city',
            zipCode: '1234AB',
            street: 'street',
            houseNumber: '1',
          },
        },
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });
      await expect(sportEvent.validate()).rejects.toThrow();
    });

    it('sportclub should be required', async () => {
      const sportEvent = new sportEventModel({
        title: 'title',
        description: 'description',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        minParticipants: 1,
        hostId: new mongoose.Types.ObjectId(),
      });
      await expect(sportEvent.validate()).rejects.toThrow();
    });
  });
});
