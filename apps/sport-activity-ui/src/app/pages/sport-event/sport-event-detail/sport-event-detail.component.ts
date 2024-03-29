import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Role, SportEvent, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { LoginService } from '../../login/login.service';
import { SportEventService } from '../sport-event.service';
import { CommonService } from '../../../shared/HelperMethods/common.service';
import Swal from 'sweetalert2';

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
  todaysDate = new Date().getTime();
  eventDate!: number;

  //subscriptions
  enrollSubcription?: Subscription;
  unenrollSubcription?: Subscription;

  constructor(
    private sportEventService: SportEventService,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private router: Router,
    private commonService: CommonService
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
        this.eventDate = new Date(this.sportEvent?.startDateAndTime).getTime();
      },
      error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
      complete: () => console.log('getting sportevent by id complete (ui)'),
    });
  }

  //////////////////////////////////////////////////////
  //////////       Enroll functionality      ///////////
  //////////////////////////////////////////////////////

  //enroll in sportevent
  enrollInSportEvent() {
    if (!this.currentUser) {
      SweetAlert.showErrorAlert('U moet ingelogd zijn om u in te schrijven');
      return;
    }

    //if event is full he cant enroll
    if (
      this.sportEvent.maximumNumberOfParticipants ===
      this.enrolledParticipants?.length
    ) {
      SweetAlert.showErrorAlert('Helaas, dit evenement zit vol');
      return;
    }

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
          SweetAlert.showErrorAlert(
            `Er is iets fout gegaan, probeer het opnieuw`
          ),
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

  //////////////////////////////////////////////
  //////    Delete & Update functionality  /////
  //////////////////////////////////////////////
  //custom confirmation for deleting a user
  sweetAlertDeleteConfirmation() {
    console.log(
      'sweetAlertDeleteConfirmation called from sportevent-list.component.ts'
    );
    Swal.fire({
      title: 'pas op!	',
      text: 'Weet je zeker dat je dit evenement wilt verwijderen?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Verwijderen',
      cancelButtonText: 'Annuleren',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteSportEvent();
      }
    });
  }

  //delete sportevent
  deleteSportEvent() {
    console.log('deleting sportevent (ui)');
    if (
      this.sportEvent.hostId !== this.currentUser?._id &&
      this.isAdmin === false
    ) {
      SweetAlert.showErrorAlert(
        'U bent niet de host van dit sportevent, u kunt het niet verwijderen'
      );
      return;
    }

    this.sportEventService
      .deleteSportEvent(this.sportEventId as string)
      .subscribe({
        next: () => {
          SweetAlert.showSuccessAlert('Sportevent succesvol verwijderd');
          this.commonService.updateSportEventList();
          this.router.navigate(['/sportevents']);
        },
        error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
        complete: () => console.log('deleting sportevent complete (ui)'),
      });
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
