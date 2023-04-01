import { Test, TestingModule } from '@nestjs/testing';
import { SportEventController } from '../sport-event.controller';

describe('SportEventController', () => {
  let controller: SportEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportEventController],
    }).compile();

    controller = module.get<SportEventController>(SportEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
