import { INestApplication, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { SportEventModule } from './sport-event/sport-event.module';
import { MongoClient } from 'mongodb';
import { Neo4jModule } from 'nest-neo4j/dist';
import { disconnect } from 'mongoose';
let mongod: MongoMemoryServer;
let uri: string;

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        return { uri };
      },
    }),
    Neo4jModule.forRoot({
      scheme: 'neo4j',
      host: 'localhost',
      port: 7687,
      username: 'neo4j',
      password: 'test123!',
      database: 'test',
    }),

    AuthModule,
    UserModule,
    SportEventModule,
  ],
  controllers: [],
  providers: [],
})
export class TestAppModule {}

describe('SportActivityApi', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let mongoc: MongoClient;
  let server;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    app.setGlobalPrefix('api');

    mongoc = new MongoClient(uri);
    await mongoc.connect();

    server = app.getHttpServer();
  });

  beforeEach(async () => {
    //delete mongoose collections
    await mongoc.db('test').collection('users').deleteMany({});
    await mongoc.db('test').collection('sportevents').deleteMany({});
  });

  afterAll(async () => {
    await app.close();
    await mongoc.close();
    await disconnect();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should create a new user', async () => {
    const result = await request(server).post('/user/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe2@gmail.com',
      password: 'Secret123!',
      city: 'Breda',
    });

    expect(result.statusCode).toBe(201);
    expect(result.body.message).toBe('User succesfully created');
  });

  it('should not create a new user since email is in the wrong format', async () => {
    const result = await request(server).post('/user/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe2gmail.com',
      password: 'Secret123!',
      city: 'Breda',
    });

    expect(result.statusCode).toBe(400);
    expect(result.body.message).toBe(
      'User validation failed: email: Invalid email address'
    );
  });
});
