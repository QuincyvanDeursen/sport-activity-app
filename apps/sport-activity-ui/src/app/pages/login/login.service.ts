import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '@sport-activity-app/domain';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

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
  public currentUser!: User;

  constructor(private http: HttpClient, private router: Router) {
    if (localStorage.getItem('token')) {
      this.currentUser = this.jwtHelperService.decodeToken(
        localStorage.getItem('token') || ''
      );
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
          return this.currentUser;
        })
      );
  }

  //method to check if a user is logged in.
  loggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !this.jwtHelperService.isTokenExpired(token || '');
  }

  //method to logout a user.
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
