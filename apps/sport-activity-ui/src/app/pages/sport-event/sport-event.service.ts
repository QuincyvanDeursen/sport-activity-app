import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SportEvent } from '@sport-activity-app/domain';
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
export class SportEventService {
  constructor(private http: HttpClient) {
    console.log(httpOptions.headers);
  }

  //get all sport events request
  getAllSportEvents(): Observable<SportEvent[]> {
    console.log('get all sport events ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .get<SportEvent[]>(`${environment.SERVER_API_URL}sportevent`, httpOptions)
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );
    return result;
  }

  //get sport event by id request
  getSportEventById(sportEventId: string): Observable<SportEvent> {
    console.log('get sport event by id ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .get<SportEvent>(
        `${environment.SERVER_API_URL}sportevent/${sportEventId}`,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //create sport event request
  createSportEvent(sportEvent: SportEvent): Observable<SportEvent> {
    console.log('create sport event ui-service called');
    console.log(httpOptions.headers);
    const body = JSON.stringify(sportEvent);
    const result = this.http
      .post<SportEvent>(
        `${environment.SERVER_API_URL}sportevent/create`,
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

  //update sport event request
  updateSportEvent(sportEvent: SportEvent): Observable<SportEvent> {
    console.log('update sport event ui-service called');
    console.log(httpOptions.headers);
    const body = JSON.stringify(sportEvent);
    const result = this.http
      .put<SportEvent>(
        `${environment.SERVER_API_URL}sportevent`,
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

  //delete sport event request
  deleteSportEvent(sportEventId: string): Observable<SportEvent> {
    console.log('delete sport event ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .delete<SportEvent>(
        `${environment.SERVER_API_URL}sportevent/${sportEventId}`,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //enroll in sport event request
  enrollInSportEvent(enrollRequest: {
    currentUserId: string;
    sportEventId: string;
  }): Observable<any> {
    console.log('enroll in sport event ui-service called');
    console.log(httpOptions.headers);
    const body = JSON.stringify(enrollRequest);
    const result = this.http
      .post<object>(
        `${environment.SERVER_API_URL}sportevent/enroll`,
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

  //unenroll in sport event request
  unenrollInSportEvent(unenrollRequest: {
    currentUserId: string | undefined;
    sportEventId: string | undefined;
  }): Observable<any> {
    console.log('unenroll in sport event ui-service called');
    console.log(httpOptions.headers);
    const body = JSON.stringify(unenrollRequest);
    const result = this.http
      .post<object>(
        `${environment.SERVER_API_URL}sportevent/unenroll`,
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

  //get recommended sport events request
  getRecommendedSportEvents(userId: string): Observable<SportEvent[]> {
    console.log('get recommended sport events ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .get<SportEvent[]>(
        `${environment.SERVER_API_URL}sportevent/recommended/${userId}`,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //get sport events currently enrolled in request
  getSportEventsCurrentlyEnrolledIn(userId: string): Observable<SportEvent[]> {
    console.log('get sport events currently enrolled in ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .get<SportEvent[]>(
        `${environment.SERVER_API_URL}sportevent/enrolled/${userId}`,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //get sport events created by user request
  getHostedSportEvents(userId: string): Observable<SportEvent[]> {
    console.log('get sport events created by user ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .get<SportEvent[]>(
        `${environment.SERVER_API_URL}sportevent/hosted/${userId}`,
        httpOptions
      )
      .pipe(
        map((response: any) => {
          return response.results;
        })
      );

    return result;
  }

  //get guestlist for sport event request
  getGuestlistForSportEvent(sportEventId: string): Observable<any> {
    console.log('get guestlist for sport event ui-service called');
    console.log(httpOptions.headers);
    const result = this.http
      .get<any>(
        `${environment.SERVER_API_URL}sportevent/${sportEventId}/guestlist`,
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
