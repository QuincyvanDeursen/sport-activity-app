import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Address, AddressDocument, AddressSchema } from '../address.schema';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Address schema test', () => {
  let addressModel: Model<AddressDocument>;
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
          { name: Address.name, schema: AddressSchema },
        ]),
      ],
    }).compile();

    addressModel = app.get<Model<AddressDocument>>(getModelToken(Address.name));
  });

  //required
  it('city should be required', async () => {
    const address = new addressModel({
      zipCode: '1234AB',
      street: 'street',
      houseNumber: '1',
    });
    await expect(address.validate()).rejects.toThrow();
  });

  //required
  it('zipCode should be required', async () => {
    const address = new addressModel({
      city: 'city',
      street: 'street',
      houseNumber: '1',
    });
    await expect(address.validate()).rejects.toThrow();
  });

  //required
  it('street should be required', async () => {
    const address = new addressModel({
      city: 'city',
      zipCode: '1234AB',
      houseNumber: '1',
    });
    await expect(address.validate()).rejects.toThrow();
  });

  //required
  it('houseNumber should be required', async () => {
    const address = new addressModel({
      city: 'city',
      zipCode: '1234AB',
      street: 'street',
    });
    await expect(address.validate()).rejects.toThrow();
  });

  it('should be created', async () => {
    const address = new addressModel({
      city: 'city',
      zipCode: '1234AB',
      street: 'street',
      houseNumber: '1',
    });
    await expect(address.validate()).resolves.not.toThrowError();
  });
});
