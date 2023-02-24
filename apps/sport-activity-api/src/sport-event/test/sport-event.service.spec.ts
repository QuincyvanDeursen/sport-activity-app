import { Test, TestingModule } from '@nestjs/testing';
import { SportEventService } from '../sport-event.service';

describe('SportEventService', () => {
  let service: SportEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SportEventService],
    }).compile();

    service = module.get<SportEventService>(SportEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
