import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@sport-activity-app/domain';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }),
};
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  //get all users request
  getAllUsers(): Observable<User[]> {
    const result = this.http
      .get<User[]>(`${environment.SERVER_API_URL}user`, httpOptions)
      .pipe(
        map((response: any) => {
          console.log(response.results.map((user: any) => user));
          return response.results;
        })
      );

    console.log('get all users ui-service');
    return result;
  }

  //follow user request
  followUser(followRequest: {
    currentUserId: string | undefined;
    userToFollowId: string | undefined;
  }): Observable<any> {
    const body = JSON.stringify(followRequest);
    const result = this.http
      .post<object>(
        `${environment.SERVER_API_URL}user/follow`,
        body,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          console.log(response.results);
          return response.results;
        })
      );

    console.log('follow user ui-service');
    return result;
  }
}
