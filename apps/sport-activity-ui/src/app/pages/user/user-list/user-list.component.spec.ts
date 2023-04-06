import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../user.service';
import { of, throwError } from 'rxjs';
import { Role, User } from '@sport-activity-app/domain';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { LoginService } from '../../login/login.service';
import { IncludesPipe } from '../../../CustomPipes/IncludePipe';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: UserService;
  let loginService: LoginService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListComponent, IncludesPipe],
      imports: [HttpClientTestingModule],
    }).compileComponents();
    userService = TestBed.inject(UserService);
    loginService = TestBed.inject(LoginService);

    loginService.currentUser = {
      _id: '123456',
      firstName: 'test',
      lastName: 'test',
      email: 'test@gmail.com',
      password: 'test',
      roles: [Role.User],
      city: 'test',
      followingUsers: [],
    };
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getUsers', () => {
      const getUsersSpy = jest.spyOn(component, 'getUsers');
      component.ngOnInit();
      expect(getUsersSpy).toHaveBeenCalled();
    });

    it('should call assignCurrentUser', () => {
      const assignCurrentUserSpy = jest.spyOn(component, 'assignCurrentUser');
      component.ngOnInit();
      expect(assignCurrentUserSpy).toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('should call userService.getAllUsers', () => {
      const getAllUsersSpy = jest.spyOn(userService, 'getAllUsers');
      component.getUsers();
      expect(getAllUsersSpy).toHaveBeenCalled();
    });

    it('should set users to the result of userService.getAllUsers', () => {
      //arrange
      const users: User[] = [
        {
          _id: '123456',
          firstName: 'test',
          lastName: 'test',
          email: 'test@gmail.com',
          password: 'test',
          roles: [Role.User],
          city: 'test',
        },
        {
          _id: '1234567',
          firstName: 'test',
          lastName: 'test',
          email: 'test@gmail.com',
          password: 'test',
          roles: [Role.User],
          city: 'test',
        },
      ];

      const userServiceSpy = jest
        .spyOn(userService, 'getAllUsers')
        .mockReturnValue(of(users));
      //act
      component.getUsers();
      //assert
      expect(component.users).toEqual(users);
      expect(userServiceSpy).toHaveBeenCalled();
    });

    it('should call SweetAlert.showErrorAlert when there is an error', () => {
      jest
        .spyOn(userService, 'getAllUsers')
        .mockReturnValue(throwError('Error'));
      const showErrorAlertSpy = jest.spyOn(SweetAlert, 'showErrorAlert');
      component.getUsers();
      expect(showErrorAlertSpy).toHaveBeenCalledWith(
        'Er is iets fout gegaan, mogelijk bestaan er geen users!'
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user and show success alert', () => {
      //arrange
      const mockUser: User = {
        _id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        roles: [Role.User],
        city: 'Amsterdam',
      };
      component.users = [mockUser];
      component.filteredUsers = [mockUser];

      component.currentUser = {
        _id: '456',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password',
        roles: [Role.Admin],
        city: 'Rotterdam',
      };

      const deleteUserSpy = jest
        .spyOn(userService, 'deleteUser')
        .mockReturnValue(of(null));

      const sweetAlertSpy = jest.spyOn(SweetAlert, 'showSuccessAlert');

      //act
      component.deleteUser(mockUser._id);

      //assert
      expect(deleteUserSpy).toHaveBeenCalledWith(mockUser._id);
      expect(component.users).toEqual([]);
      expect(component.filteredUsers).toEqual([]);
      expect(sweetAlertSpy).toHaveBeenCalledWith('Gebruiker verwijderd!');
    });

    it('should show error alert when there is an error', () => {
      //arrange
      const mockUser: User = {
        _id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'example@gmail.com',
        password: 'password',
        roles: [Role.User],
        city: 'Amsterdam',
      };
      component.users = [mockUser];
      component.filteredUsers = [mockUser];

      component.currentUser = {
        _id: '456',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'example3@gmail.com',
        password: 'password',
        roles: [Role.Admin],
        city: 'Rotterdam',
      };

      const deleteUserSpy = jest
        .spyOn(userService, 'deleteUser')
        .mockReturnValue(throwError('Error'));

      //act
      component.deleteUser(mockUser._id);

      //assert
      expect(deleteUserSpy).toHaveBeenCalledWith(mockUser._id);
    });

    it('should show error alert the user to delete is currentUser', () => {
      //arrange
      const mockUser: User = {
        _id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'example@gmail.com',
        password: 'password',
        roles: [Role.User],
        city: 'Amsterdam',
      };
      component.users = [mockUser];
      component.filteredUsers = [mockUser];

      component.currentUser = mockUser;

      const deleteUserSpy = jest.spyOn(userService, 'deleteUser');
      const sweetAlertSpy = jest.spyOn(SweetAlert, 'showErrorAlert');

      //act
      component.deleteUser(component.currentUser._id);

      //assert
      expect(deleteUserSpy).not.toHaveBeenCalled();
      expect(sweetAlertSpy).toHaveBeenCalledWith(
        'Je kan jezelf niet verwijderen'
      );
    });
  });

  describe('followUser', () => {
    it('should follow user', () => {
      //arrange
      const mockUser: User[] = [
        {
          _id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password',
          roles: [Role.User],
          city: 'Amsterdam',
        },
      ];
      component.users = mockUser;
      component.filteredUsers = mockUser;

      component.currentUser = {
        _id: '789',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password',
        roles: [Role.Admin],
        city: 'Rotterdam',
        followingUsers: [],
      };

      const sweetAlertSpyObj = jest.spyOn(SweetAlert, 'showSuccessAlert');
      const followUserSpy = jest
        .spyOn(userService, 'followUser')
        .mockReturnValue(of(null));

      //act
      component.followUser(mockUser[0]._id);

      //assert
      expect(followUserSpy).toHaveBeenCalledWith({
        currentUserId: '789',
        userToFollowId: '123',
      });
      expect(sweetAlertSpyObj).toHaveBeenCalledWith(
        'Je volgt deze gebruiker nu!'
      );
      expect(component.currentUser.followingUsers).toEqual([mockUser[0]._id]);
    });

    it('should show error alert when user already follows the user', () => {
      //arrange
      const mockUser: User[] = [
        {
          _id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password',
          roles: [Role.User],
          city: 'Amsterdam',
        },
      ];
      component.users = mockUser;
      component.filteredUsers = mockUser;

      component.currentUser = {
        _id: '789',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password',
        roles: [Role.Admin],
        city: 'Rotterdam',
        followingUsers: ['123'],
      };

      const sweetAlertSpyObj = jest.spyOn(SweetAlert, 'showErrorAlert');
      const followUserSpy = jest.spyOn(userService, 'followUser');

      //act
      component.followUser(mockUser[0]._id);

      //assert
      expect(sweetAlertSpyObj).toHaveBeenCalledWith(
        'Je volgt deze gebruiker al'
      );
      expect(followUserSpy).not.toHaveBeenCalled();
    });

    it('should show error alert on followUser error', () => {
      // arrange
      const mockUser: User[] = [
        {
          _id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'example@gmail.com',
          password: 'password',
          roles: [Role.User],
          city: 'Amsterdam',
        },
      ];
      component.currentUser = {
        _id: '789',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'example4@gmail.com',
        password: 'password',
        roles: [Role.Admin],
        city: 'Rotterdam',
        followingUsers: [],
      };
      const userServiceSpy = jest.spyOn(userService, 'followUser');
      const error = { error: { message: 'Error message' } };
      userServiceSpy.mockReturnValue(throwError(error));
      const sweetAlertSpyObj = jest.spyOn(SweetAlert, 'showErrorAlert');

      // act
      component.followUser(mockUser[0]._id);

      // assert
      expect(userServiceSpy).toHaveBeenCalledWith({
        currentUserId: '789',
        userToFollowId: '123',
      });
      expect(sweetAlertSpyObj).toHaveBeenCalledWith('Error message');
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow user', () => {
      //arrange
      const mockUser: User[] = [
        {
          _id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'example@gmail.com',
          password: 'password',
          roles: [Role.User],
          city: 'Amsterdam',
        },
      ];
      component.users = mockUser;
      component.filteredUsers = mockUser;

      component.currentUser = {
        _id: '789',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'example3@gmail.com',
        password: 'password',
        roles: [Role.User],
        city: 'Rotterdam',
        followingUsers: ['123'],
      };

      const sweetAlertSpyObj = jest.spyOn(SweetAlert, 'showSuccessAlert');
      const unfollowUserSpy = jest
        .spyOn(userService, 'unfollowUser')
        .mockReturnValue(of(null));

      //act
      component.unfollowUser(mockUser[0]._id);

      //assert
      expect(unfollowUserSpy).toHaveBeenCalledWith({
        currentUserId: '789',
        userToUnfollowId: '123',
      });
      expect(sweetAlertSpyObj).toHaveBeenCalledWith(
        'Je volgt deze gebruiker niet meer!'
      );
      expect(component.currentUser.followingUsers).toEqual([]);
    });

    it('should show error alert on unfollowUser error', () => {
      // arrange
      const mockUser: User[] = [
        {
          _id: '123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'example@gmail.com',
          password: 'password',
          roles: [Role.User],
          city: 'Amsterdam',
        },
      ];
      component.currentUser = {
        _id: '789',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'example4@gmail.com',
        password: 'password',
        roles: [Role.User],
        city: 'Rotterdam',
        followingUsers: ['123'],
      };
      const userServiceSpy = jest.spyOn(userService, 'unfollowUser');
      const error = { error: { message: 'Error message' } };
      userServiceSpy.mockReturnValue(throwError(error));
      const sweetAlertSpyObj = jest.spyOn(SweetAlert, 'showErrorAlert');

      // act
      component.unfollowUser(mockUser[0]._id);

      // assert
      expect(userServiceSpy).toHaveBeenCalledWith({
        currentUserId: '789',
        userToUnfollowId: '123',
      });
      expect(sweetAlertSpyObj).toHaveBeenCalledWith('Error message');
    });
  });
});
