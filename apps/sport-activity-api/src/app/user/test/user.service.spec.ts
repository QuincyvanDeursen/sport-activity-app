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

describe('UserService', () => {
  let service: UserService;
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

    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    sportEventModel = app.get<Model<SportEventDocument>>(
      getModelToken(SportEvent.name)
    );

    mongoc = new MongoClient(uri);
    await mongoc.connect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    if (mongoc) {
      await mongoc.close();
      await mongod.stop();
    }
    await disconnect();
  });
});
