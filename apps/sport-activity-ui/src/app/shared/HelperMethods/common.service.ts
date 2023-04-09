import { Injectable } from '@angular/core';
import { SportEventService } from '../../pages/sport-event/sport-event.service';
import { UserService } from '../../pages/user/user.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    private sportEventService: SportEventService,
    private userService: UserService
  ) {}

  private updateSubject = new Subject();

  updateUserList() {
    this.userService.getAllEmployees().subscribe({
      next: (v) => {
        console.log(v);
        this.updateSubject.next(v);
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  updateSportEventList() {
    this.sportEventService.getAllSportEvents().subscribe({
      next: (v) => {
        this.updateSubject.next(v);
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  getUpdateSubject() {
    return this.updateSubject.asObservable();
  }
}
