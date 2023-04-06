import { Test, TestingModule } from '@nestjs/testing';
import { SportEventService } from '../sport-event.service';
import { SportEventController } from '../sport-event.controller';
import { SportEvent } from '@sport-activity-app/domain';

describe('UserController', () => {
  let app: TestingModule;
  let sportEventController: SportEventController;
  let sportEventService: SportEventService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [SportEventController],
      providers: [
        {
          // mock the service, to avoid providing its dependencies
          provide: SportEventService,
          useValue: {
            getAllSportEvents: jest.fn(),
            create: jest.fn(),
            findSportEventById: jest.fn(),
            deleteSportEventById: jest.fn(),
            updateSportEvent: jest.fn(),
            enrollUserToSportEvent: jest.fn(),
            unenrollUserFromSportEvent: jest.fn(),
            getAllUsersSportEvents: jest.fn(),
            getRecommendedSportEvents: jest.fn(),
            getHostedSportEvents: jest.fn(),
          },
        },
      ],
    }).compile();

    sportEventController = app.get<SportEventController>(SportEventController);
    sportEventService = app.get<SportEventService>(SportEventService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(sportEventController).toBeDefined();
  });

  describe('getAllSportEvents', () => {
    it('should return all sport events', async () => {
      const sportEvent1: SportEvent = {
        title: 'test',
        description: 'test',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        enrolledParticipants: [],
        hostId: '64177204075a5a1a58d07a55',
        sportclub: {
          clubName: 'test',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            street: 'test',
            houseNumber: '1',
            zipCode: '12345',
            city: 'test',
          },
        },
      };

      const sportEvent2: SportEvent = {
        title: 'test2',
        description: 'test',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        enrolledParticipants: [],
        hostId: '64177204075a5a1a58d07a55',
        sportclub: {
          clubName: 'test',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            street: 'test',
            houseNumber: '1',
            zipCode: '12345',
            city: 'test',
          },
        },
      };

      // Arrange
      const expected = [sportEvent1, sportEvent2];
      (sportEventService.getAllSportEvents as jest.Mock).mockResolvedValue(
        expected
      );

      // Act
      const result = await sportEventController.getAllSportEvents();

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should create a sport event', async () => {
      const sportEvent1: SportEvent = {
        title: 'test',
        description: 'test',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        enrolledParticipants: [],
        hostId: '64177204075a5a1a58d07a55',
        sportclub: {
          clubName: 'test',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            street: 'test',
            houseNumber: '1',
            zipCode: '12345',
            city: 'test',
          },
        },
      };

      // Arrange
      const expected = sportEvent1;
      (sportEventService.create as jest.Mock).mockResolvedValue(expected);

      // Act
      const result = await sportEventController.register(sportEvent1);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('findSportEventById', () => {
    it('should return a sport event', async () => {
      const sportEvent1: SportEvent = {
        title: 'test',
        description: 'test',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        enrolledParticipants: [],
        hostId: '64177204075a5a1a58d07a55',
        sportclub: {
          clubName: 'test',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            street: 'test',
            houseNumber: '1',
            zipCode: '12345',
            city: 'test',
          },
        },
      };

      // Arrange
      const expected = sportEvent1;
      (sportEventService.findSportEventById as jest.Mock).mockResolvedValue(
        expected
      );

      // Act
      const req = { params: { id: '64177204075a5a1a58d07a55' } };
      const result = await sportEventController.getSportEventById(req);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('deleteSportEventById', () => {
    it('should delete a sport event', async () => {
      // Arrange
      (sportEventService.deleteSportEventById as jest.Mock).mockResolvedValue(
        true
      );

      // Act
      const req = { params: { id: '64177204075a5a1a58d07a55' } };
      const result = await sportEventController.deleteSportEventById(req);

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('updateSportEvent', () => {
    it('should update a sport event', async () => {
      const sportEvent1: SportEvent = {
        title: 'test',
        description: 'test',
        price: 10,
        startDateAndTime: new Date(),
        durationInMinutes: 60,
        maximumNumberOfParticipants: 10,
        enrolledParticipants: [],
        hostId: '64177204075a5a1a58d07a55',
        sportclub: {
          clubName: 'test',
          websiteURL: 'https://www.test.com',
          email: 'test@gmail.com',
          phoneNumber: '123456789',
          address: {
            street: 'test',
            houseNumber: '1',
            zipCode: '12345',
            city: 'test',
          },
        },
      };

      // Arrange
      const expected = sportEvent1;
      (sportEventService.updateSportEvent as jest.Mock).mockResolvedValue(
        expected
      );

      // Act
      const result = await sportEventController.updateSportEventById(
        sportEvent1
      );

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('enrollParticipant', () => {
    it('should enroll a participant', async () => {
      // Arrange

      (sportEventService.enrollUserToSportEvent as jest.Mock).mockResolvedValue(
        true
      );

      // Act
      const result = await sportEventController.joinSportEvent({
        currentUserId: '64177204075a5a1a58d07a55',
        sportEventId: '64177204075a5a1a58d07a55',
      });

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('unenrollParticipant', () => {
    it('should unenroll a participant', async () => {
      // Arrange

      (
        sportEventService.unenrollUserFromSportEvent as jest.Mock
      ).mockResolvedValue(true);

      // Act
      const result = await sportEventController.leaveSportEvent({
        currentUserId: '64177204075a5a1a58d07a55',
        sportEventId: '64177204075a5a1a58d07a55',
      });

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('getSportEventsByHostId', () => {
    it('should return a sport event', async () => {
      // Arrange
      (sportEventService.getHostedSportEvents as jest.Mock).mockResolvedValue(
        true
      );

      // Act
      const result = await sportEventController.getHostedSportEvents(
        '64177204075a5a1a58d07a55'
      );

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('getUsersSportEvents', () => {
    it('should return sportevents', async () => {
      // Arrange
      (sportEventService.getAllUsersSportEvents as jest.Mock).mockResolvedValue(
        true
      );

      // Act
      const result = await sportEventController.getEnrolledSportEvents(
        '64177204075a5a1a58d07a55'
      );

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('getUsersSportEvents', () => {
    it('should return recommended sportevents', async () => {
      // Arrange
      (
        sportEventService.getRecommendedSportEvents as jest.Mock
      ).mockResolvedValue(true);

      // Act
      const result = await sportEventController.getRecommendedSportEvents(
        '64177204075a5a1a58d07a55'
      );

      // Assert
      expect(result).toEqual(true);
    });
  });
});
