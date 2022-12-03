import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Identity } from '@sport-activity-app/domain';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  login(userIdentity: Identity): Observable<any> {
    const body = JSON.stringify(userIdentity);
    return this.http.post<any>(
      'http://localhost:4200/api/auth/login',
      body,
      httpOptions
    );
  }
}
