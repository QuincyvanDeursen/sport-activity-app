import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
export class UserService {
  constructor(private http: HttpClient) {
    console.log(httpOptions.headers);
  }

  //get all users request
  getAllUsers(): Observable<User[]> {
    console.log('get all users ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .get<User[]>(`${environment.SERVER_API_URL}user`, httpOptions)
      .pipe(
        map((response: any) => {
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
    console.log('follow user ui-service called');
    console.log(httpOptions.headers);
    const body = JSON.stringify(followRequest);
    const result = this.http
      .post<object>(
        `${environment.SERVER_API_URL}user/follow`,
        body,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //unfollow user request
  unfollowUser(followRequest: {
    currentUserId: string | undefined;
    userToUnfollowId: string | undefined;
  }): Observable<any> {
    console.log('unfollow user ui-service called');
    console.log(httpOptions.headers);
    const body = JSON.stringify(followRequest);
    const result = this.http
      .post<object>(
        `${environment.SERVER_API_URL}user/unfollow`,
        body,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //delete user request
  deleteUser(id: string): Observable<any> {
    console.log('delete user ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .delete<object>(
        `${environment.SERVER_API_URL}user/delete/${id}`,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //update account settings request
  updateAccountSettings(user: User): Observable<any> {
    console.log('update account settings ui-service called');
    console.log(httpOptions.headers);
    const body = JSON.stringify(user);
    const result = this.http
      .put<object>(`${environment.SERVER_API_URL}user`, body, httpOptions)
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //get employee statistics request
  getEmployeeStatistics(id: string): Observable<any> {
    console.log('get employee statistics ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .get<object>(
        `${environment.SERVER_API_URL}user/statistics/${id}`,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }
}
