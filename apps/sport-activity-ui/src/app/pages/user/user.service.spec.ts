import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { environment } from 'apps/sport-activity-ui/src/environments/environment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from '../../interceptors/token-interceptor.service';
import { Role } from '@sport-activity-app/domain';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptorService,
          multi: true,
        },
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsers', () => {
    it('should make a GET request to /users', () => {
      const expectedResponse = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];

      service.getAllUsers().subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(environment.SERVER_API_URL + 'user');
      expect(req.request.method).toEqual('GET');
      req.flush(expectedResponse);
    });

    it('should include authorization header in GET request', () => {
      const token = 'my-auth-token';
      localStorage.setItem('token', token); // set token in localStorage

      service.getAllUsers().subscribe();

      const req = httpMock.expectOne(environment.SERVER_API_URL + 'user');
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush([]);
    });
  });

  describe('followUser', () => {
    it('should make a POST request to /user/follow', () => {
      const expectedResponse = { id: 1, name: 'Alice' };

      service
        .followUser({ currentUserId: '1', userToFollowId: '2' })
        .subscribe((response) => {
          expect(response).toEqual(expectedResponse);
        });

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/follow'
      );
      expect(req.request.method).toEqual('POST');
      req.flush(expectedResponse);
    });

    it('should include authorization header in POST request', () => {
      const token = 'my-auth-token';
      localStorage.setItem('token', token); // set token in localStorage

      service
        .followUser({ currentUserId: '1', userToFollowId: '2' })
        .subscribe();

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/follow'
      );
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush([]);
    });
  });

  describe('unfollowUser', () => {
    it('should make a POST request to /user/unfollow', () => {
      const expectedResponse = { id: 1, name: 'Alice' };

      service
        .unfollowUser({ currentUserId: '1', userToUnfollowId: '2' })
        .subscribe((response) => {
          expect(response).toEqual(expectedResponse);
        });

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/unfollow'
      );
      expect(req.request.method).toEqual('POST');
      req.flush(expectedResponse);
    });

    it('should include authorization header in POST request', () => {
      const token = 'my-auth-token';
      localStorage.setItem('token', token); // set token in localStorage

      service
        .unfollowUser({ currentUserId: '1', userToUnfollowId: '2' })
        .subscribe();

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/unfollow'
      );
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush([]);
    });
  });

  describe('deleteUser', () => {
    it('should make a DELETE request to /user', () => {
      const expectedResponse = { id: 1, name: 'Alice' };

      service.deleteUser('1').subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/delete/1'
      );
      expect(req.request.method).toEqual('DELETE');
      req.flush(expectedResponse);
    });

    it('should include authorization header in DELETE request', () => {
      const token = 'my-auth-token';
      localStorage.setItem('token', token); // set token in localStorage

      service.deleteUser('2').subscribe();

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/delete/2'
      );
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush([]);
    });
  });

  describe('updateAccountSettings', () => {
    it('should make a PUT request to /user', () => {
      const user = {
        _id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'test@gmail.com',
        password: 'test',
        roles: [Role.User],
        city: 'Warsaw',
      };

      service.updateAccountSettings(user).subscribe();

      const req = httpMock.expectOne(environment.SERVER_API_URL + 'user');
      expect(req.request.method).toEqual('PUT');
    });

    it('should include authorization header in PUT request', () => {
      const token = 'my-auth-token';
      localStorage.setItem('token', token); // set token in localStorage
      const user = {
        _id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'test@gmail.com',
        password: 'test',
        roles: [Role.User],
        city: 'Warsaw',
      };

      service.updateAccountSettings(user).subscribe();
      const req = httpMock.expectOne(environment.SERVER_API_URL + 'user');
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush([]);
    });
  });

  describe('getEmployeeStatistics', () => {
    it('should make a GET request to /user/statistics/:id', () => {
      const expectedResponse = {
        totalHours: 10,
        totalTasks: 5,
        totalProjects: 2,
      };

      service.getEmployeeStatistics('1').subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/statistics/1'
      );
      expect(req.request.method).toEqual('GET');
      req.flush(expectedResponse);
    });

    it('should include authorization header in GET request', () => {
      const token = 'my-auth-token';
      localStorage.setItem('token', token); // set token in localStorage
      const expectedResponse = {
        totalHours: 10,
        totalTasks: 5,
        totalProjects: 2,
      };

      service.getEmployeeStatistics('1').subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/statistics/1'
      );
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush(expectedResponse);
    });
  });
});
