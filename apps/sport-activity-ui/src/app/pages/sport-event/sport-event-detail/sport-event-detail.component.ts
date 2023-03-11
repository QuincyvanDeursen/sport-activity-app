import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Role, SportEvent, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { LoginService } from '../../login/login.service';
import { SportEventService } from '../sport-event.service';

@Component({
  selector: 'sport-activity-app-sport-event-detail',
  templateUrl: './sport-event-detail.component.html',
  styleUrls: ['./sport-event-detail.component.css'],
})
export class SportEventDetailComponent implements OnInit, OnDestroy {
  sportEventId: string | null | undefined;
  sportEvent!: SportEvent;
  currentUser?: User;
  isEmployee = false;
  isAdmin = false;
  isUser = false;
  enrolledParticipants?: string[];

  //subscriptions
  enrollSubcription?: Subscription;
  unenrollSubcription?: Subscription;

  constructor(
    private sportEventService: SportEventService,
    private route: ActivatedRoute,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    console.log('sport-event-detail.component.ts initialized');
    this.assignCurrentUser();
    this.route.paramMap.subscribe((params) => {
      this.sportEventId = params.get('id');
      if (this.sportEventId) {
        this.getSportEventById(this.sportEventId);
      }
    });
  }

  ngOnDestroy(): void {
    console.log('sport-event-detail.component.ts destroyed');
    if (this.enrollSubcription) {
      this.enrollSubcription.unsubscribe();
    }
    if (this.unenrollSubcription) {
      this.unenrollSubcription.unsubscribe();
    }
  }

  ///////////////////////////////////////////////////////////
  //////////       Get sportevent functionality      ////////
  ///////////////////////////////////////////////////////////

  //get sportevent by id
  getSportEventById(id: string) {
    console.log('getting sportevent by id (ui)');
    this.sportEventService.getSportEventById(id).subscribe({
      next: (v) => {
        console.log(v);
        this.sportEvent = v;
        this.enrolledParticipants = v.enrolledParticipants;
      },
      error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
      complete: () => console.log('getting sportevent by id complete (ui)'),
    });
  }

  //enroll in sportevent
  enrollInSportEvent() {
    if (!this.currentUser) {
      SweetAlert.showErrorAlert('U moet ingelogd zijn om u in te schrijven');
      return;
    }

    //if user is already enrolled in sportevent, he can't enroll again

    console.log('enrolling in sportevent (ui)');
    const enrollRequest = {
      currentUserId: this.currentUser._id as string,
      sportEventId: this.sportEventId as string,
    };
    this.enrollSubcription = this.sportEventService
      .enrollInSportEvent(enrollRequest)
      .subscribe({
        next: () => {
          SweetAlert.showSuccessAlert('Je bent succesvol ingeschreven!');
          this.updateEnrolledParticipantArrayUpOnEnrolling(
            this.currentUser?._id as string
          );
        },
        error: (e) =>
          SweetAlert.showErrorAlert(`Er is iets fout gegaan ${e.message}`),
        complete: () => console.log('enrolling in sportevent complete (ui)'),
      });
  }

  //unenroll in sportevent
  unenrollInSportEvent() {
    if (!this.currentUser) {
      SweetAlert.showErrorAlert('U moet ingelogd zijn om u uit te schrijven');
      return;
    }

    //if user is not enrolled in sportevent, he can't unenroll
    if (!this.enrolledParticipants?.includes(this.currentUser?._id as string)) {
      SweetAlert.showErrorAlert('U bent niet ingeschreven voor dit sportevent');
      return;
    }
    console.log('unenrolling in sportevent (ui)');
    const unenrollRequest = {
      currentUserId: this.currentUser._id as string,
      sportEventId: this.sportEventId as string,
    };
    this.unenrollSubcription = this.sportEventService
      .unenrollInSportEvent(unenrollRequest)
      .subscribe({
        next: () => {
          SweetAlert.showSuccessAlert('Je bent succesvol uitgeschreven!');
          this.enrolledParticipants = this.enrolledParticipants?.filter(
            (participant) => participant !== this.currentUser?._id
          );
        },
        error: (e) =>
          SweetAlert.showErrorAlert(`Er is iets fout gegaan ${e.message}`),
        complete: () => console.log('unenrolling in sportevent complete (ui)'),
      });
  }

  private updateEnrolledParticipantArrayUpOnEnrolling(userToEnrollId: string) {
    if (this.enrolledParticipants?.includes(this.currentUser?._id as string)) {
      SweetAlert.showErrorAlert('U bent al ingeschreven voor dit evenement');
      return;
    }
    if (this.enrolledParticipants !== undefined) {
      this.enrolledParticipants = [
        ...this.enrolledParticipants,
        userToEnrollId,
      ];
    }
  }

  ///////////////////////////////////////////////////////////
  ////////////////       Current user      //////////////////
  ///////////////////////////////////////////////////////////

  private currentUserHasRoleEmployee(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.Employee)) {
      this.isEmployee = true;
    } else {
      this.isEmployee = false;
    }
  }

  private currentUserHasRoleAdmin(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.Admin)) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }

  private currentUserHasRoleUser(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.User)) {
      this.isUser = true;
    } else {
      this.isUser = false;
    }
  }

  private assignCurrentUser() {
    if (this.loginService.currentUser) {
      this.currentUser = this.loginService.currentUser;
      this.currentUserHasRoleEmployee();
      this.currentUserHasRoleAdmin();
      this.currentUserHasRoleUser();
    }
  }
}
