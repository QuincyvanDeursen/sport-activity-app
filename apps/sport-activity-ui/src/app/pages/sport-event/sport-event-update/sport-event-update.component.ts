import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Role, SportEvent, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { LoginService } from '../../login/login.service';
import { SportEventService } from '../sport-event.service';

@Component({
  selector: 'sport-activity-app-sport-event-update',
  templateUrl: './sport-event-update.component.html',
  styleUrls: ['./sport-event-update.component.css'],
})
export class SportEventUpdateComponent implements OnInit {
  //current user data
  currentUser!: User;
  isEmployee = false;

  sportEventDateString!: string;

  //sportevent id
  sportEventId: string | null | undefined;

  constructor(
    private loginService: LoginService,
    private sportEventService: SportEventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  //subscription
  createSportEventSubscription?: Subscription;

  //sportevent data
  sportEventToUpdate!: SportEvent;

  ngOnInit(): void {
    this.assignCurrentUser();
    this.route.paramMap.subscribe((params) => {
      this.sportEventId = params.get('id');
      if (this.sportEventId) {
        this.getSportEventById(this.sportEventId);
      }
    });
  }

  ///////////////////////////////////////////////////////////
  //////////       Get sportevent functionality      ////////
  ///////////////////////////////////////////////////////////

  getSportEventById(id: string) {
    console.log('getting sportevent by id (ui)');
    this.sportEventService.getSportEventById(id).subscribe({
      next: (v) => {
        this.sportEventToUpdate = v;
        this.sportEventDateString = this.toDateString(
          new Date(this.sportEventToUpdate.startDateAndTime)
        );
        console.log(this.sportEventDateString);
      },
      error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
      complete: () => console.log('getting sportevent by id complete (ui)'),
    });
  }

  private toDateString(date: Date): string {
    return (
      date.getFullYear().toString() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2) +
      'T' +
      date.toTimeString().slice(0, 5)
    );
  }

  ///////////////////////////////////////////////////////////
  ////////////            Update Sportevent /////////////////
  ///////////////////////////////////////////////////////////

  updateSportEvent(): void {
    console.log('updating sportevent (ui)');
    this.sportEventToUpdate.startDateAndTime = new Date(
      this.sportEventDateString
    );
    this.createSportEventSubscription = this.sportEventService
      .updateSportEvent(this.sportEventToUpdate)
      .subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/sportevents']);
            SweetAlert.showSuccessAlert('Sportevent succesvol geupdate!');
          }
        },
        error: (error) => {
          console.error('Update Sportevent failed', error);
          SweetAlert.showErrorAlert(
            'Sportevent updaten mislukt, probeer het nog eens!'
          );
        },
        complete: () => {
          console.log('Update Sportevent completed');
        },
      });
  }

  ///////////////////////////////////////////////////////////
  /////////       Check current user data   /////////////////
  ///////////////////////////////////////////////////////////

  private assignCurrentUser() {
    if (this.loginService.currentUser) {
      this.currentUser = this.loginService.currentUser;
      this.currentUserHasRoleEmployee();
    }
  }

  private currentUserHasRoleEmployee(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.Employee)) {
      this.isEmployee = true;
    } else {
      this.isEmployee = true;
    }
  }
}
