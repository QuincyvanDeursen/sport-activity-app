import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from '../../interceptors/token-interceptor.service';
import { RegisterService } from './register.service';
import { Role } from '@sport-activity-app/domain';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
  let service: RegisterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RegisterService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptorService,
          multi: true,
        },
      ],
    });
    service = TestBed.inject(RegisterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('register', () => {
    it('should make a POST request to /register', () => {
      const expectedResponse = {
        _id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'test@gmail.com',
        password: 'test',
        roles: [Role.User],
        city: 'Warsaw',
      };

      service.register(expectedResponse).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/register'
      );
      expect(req.request.method).toEqual('POST');
      req.flush(expectedResponse);
    });

    it('should include authorization header in POST request', () => {
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

      service.register(user).subscribe();
      const req = httpMock.expectOne(
        environment.SERVER_API_URL + 'user/register'
      );
      expect(req.request.headers.has('Authorization')).toBeTruthy();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush([]);
    });
  });
});
