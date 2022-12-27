import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@sport-activity-app/domain';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private http: HttpClient, private router: Router) {}

  //register request.
  register(user: User): Observable<any> {
    console.log('register request');
    const body = JSON.stringify(user);
    return this.http.post<any>(
      `${environment.SERVER_API_URL}user/register`,
      body,
      httpOptions
    );
  }
}
