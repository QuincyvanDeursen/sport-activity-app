import { Test, TestingModule } from '@nestjs/testing';
import { Neo4JService } from './neo4-j.service';

describe('Neo4JService', () => {
  let service: Neo4JService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Neo4JService],
    }).compile();

    service = module.get<Neo4JService>(Neo4JService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
