import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '@sport-activity-app/domain';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  jwtHelperService = new JwtHelperService();
  public currentUser?: User;
  public userIdentity?: { username: string; password: string };
  public isLoggedIn = new BehaviorSubject<User | undefined>(undefined);

  constructor(private http: HttpClient) {
    if (localStorage.getItem('token')) {
      this.currentUser = this.jwtHelperService.decodeToken(
        localStorage.getItem('token') || ''
      );
      this.isLoggedIn.next(this.currentUser);
    }
  }

  //login request.
  login(userIdentity: { username: string; password: string }): Observable<any> {
    const body = JSON.stringify(userIdentity);
    return this.http
      .post<any>(`${environment.SERVER_API_URL}auth/login`, body, httpOptions)
      .pipe(
        map((response: any) => {
          this.currentUser = this.jwtHelperService.decodeToken(
            response.results.access_token
          );
          localStorage.setItem('token', response.results.access_token);
          this.isLoggedIn.next(this.currentUser);
          this.userIdentity = userIdentity;
          return this.currentUser;
        })
      );
  }

  //method to logout a user.
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn.next(undefined);
    this.currentUser = undefined;
  }
}
