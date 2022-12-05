import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Identity } from '@sport-activity-app/domain';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  jwtHelperService = new JwtHelperService();
  public currentUser = {
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    city: '',
    roles: [],
    sportclub: '',
  };

  constructor(private http: HttpClient, private router: Router) {}

  //login request.
  login(userIdentity: Identity): Observable<any> {
    const body = JSON.stringify(userIdentity);
    return this.http
      .post<any>(`${environment.SERVER_API_URL}auth/login`, body, httpOptions)
      .pipe(
        map((response: any) => {
          const decodedToken = this.jwtHelperService.decodeToken(
            response.access_token
          );
          this.DecodedTokenToUser(decodedToken);
          localStorage.setItem('token', response.access_token);
          return this.currentUser;
        })
      );
  }

  loggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !this.jwtHelperService.isTokenExpired(token || '');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  DecodedTokenToUser(decodedToken: any) {
    console.log('DecodedTokenToUser method called');
    this.currentUser.id = decodedToken.id;
    this.currentUser.email = decodedToken.email;
    this.currentUser.firstName = decodedToken.firstname;
    this.currentUser.lastName = decodedToken.lastName;
    this.currentUser.city = decodedToken.city;
    this.currentUser.roles = decodedToken.roles;
    this.currentUser.sportclub = decodedToken.sportclub;
  }
}
