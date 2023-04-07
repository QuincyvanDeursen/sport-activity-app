import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserController } from '../user.controller';
import { Role } from '@sport-activity-app/domain';

describe('UserController', () => {
  let app: TestingModule;
  let userController: UserController;
  let userService: UserService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          // mock the service, to avoid providing its dependencies
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findUserById: jest.fn(),
            getAllUsers: jest.fn(),
            followUser: jest.fn(),
            unfollowUser: jest.fn(),
            deleteUser: jest.fn(),
            updateAccountSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = app.get<UserController>(UserController);
    userService = app.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('register', () => {
    it('should return the created user', async () => {
      // Arrange
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@gmail.com',
        password: 'Test123!',
        role: 'User',
        city: 'Test City',
        roles: [Role.User],
      };
      const expected = { id: 123, ...mockUser };
      (userService.create as jest.Mock).mockResolvedValue(expected);

      // Act
      const result = await userController.register(mockUser);

      // Assert
      expect(userService.create).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('get Users', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        {
          email: 'alice@example.com',
          firstName: 'Alice',
          lastName: 'Smith',
          city: 'New York',
          roles: ['user'],
        },
        {
          email: 'bob@example.com',
          firstName: 'Bob',
          lastName: 'Johnson',
          city: 'Los Angeles',
          roles: ['user'],
        },
      ];
      (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await userController.getAllUsers();

      // Assert
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    // it('should return a user object by ID', async () => {
    //   // create a mock user object
    //   const mockUser = {
    //     _id: 'some-id',
    //     email: 'test@example.com',
    //     password: 'password',
    //     firstName: 'John',
    //     lastName: 'Doe',
    //     city: 'New York',
    //     roles: [Role.User],
    //   };

    //   userService.findUserById = jest.fn().mockResolvedValue(mockUser);

    //   const response = await userController.getUserById({
    //     params: { id: 'some-id' },
    //   });

    //   expect(response).toEqual(mockUser);

    //   expect(userService.findUserById).toHaveBeenCalledWith('some-id');
    // });
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      // Arrange
      const mockResult = { success: true };
      const mockFollowRequest = { currentUserId: '1', userToFollowId: '2' };
      (userService.followUser as jest.Mock).mockResolvedValue(mockResult);

      // Act
      const result = await userController.followUser(mockFollowRequest);

      // Assert
      expect(userService.followUser).toHaveBeenCalledWith(
        mockFollowRequest.currentUserId,
        mockFollowRequest.userToFollowId
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('unfollowUser', () => {
    it('should call userService.unfollowUser with the correct parameters', async () => {
      const currentUserId = 'currentUserId';
      const userToUnfollowId = 'userToUnfollowId';
      const request = { currentUserId, userToUnfollowId };
      const expectedResult = { message: 'User unfollowed successfully' };

      jest.spyOn(userService, 'unfollowUser').mockResolvedValue(expectedResult);

      const result = await userController.unfollowUser(request);

      expect(result).toEqual(expectedResult);
      expect(userService.unfollowUser).toHaveBeenCalledWith(
        currentUserId,
        userToUnfollowId
      );
    });
  });
  describe('delete a user', () => {
    it('should delete a user', async () => {
      const spy = jest.spyOn(userService, 'deleteUser');
      const id = '123';
      const result = { message: 'User deleted successfully' };
      spy.mockResolvedValue(result);

      const req = { params: { id } };
      const res = await userController.deleteUser(req);

      expect(spy).toHaveBeenCalledWith(id);
      expect(res).toEqual(result);
    });
  });

  describe('updateAccountSettings', () => {
    it('should update account settings for a user', async () => {
      const user = {
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        city: 'Test City',
        roles: [Role.User],
      };

      const updatedUser = { ...user, city: 'New City' };
      jest
        .spyOn(userService, 'updateAccountSettings')
        .mockResolvedValue(updatedUser);

      const result = await userController.updateAccountSettings(user);

      expect(result).toEqual(updatedUser);
    });
  });
});
