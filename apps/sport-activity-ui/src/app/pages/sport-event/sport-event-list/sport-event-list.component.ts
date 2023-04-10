import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role, SportEvent, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { LoginService } from '../../login/login.service';
import { SportEventService } from '../sport-event.service';
import { CommonService } from '../../../shared/HelperMethods/common.service';

@Component({
  selector: 'sport-activity-app-sport-event-list',
  templateUrl: './sport-event-list.component.html',
  styleUrls: ['./sport-event-list.component.css'],
})
export class SportEventListComponent implements OnInit, OnDestroy {
  sportEvents: SportEvent[] = [];

  //filter
  private _sportEventTitle = '';
  private _sportEventCity = '';
  filteredSportEvents: SportEvent[] = this.sportEvents;
  recommendationIsShowing = false;
  enrolledSportEventsIsShowing = false;
  hostedSportEventsIsShowing = false;

  //subscriptions
  getAllSportEventsSubscription?: Subscription;
  deleteSportEventSubscription?: Subscription;
  getRecommendedSportEventsSubscription?: Subscription;
  getEnrolledSportEventsSubscription?: Subscription;
  getHostedSportEventsSubscription?: Subscription;
  commonServiceSubscription?: Subscription;

  //current user data
  currentUser!: User;
  isAdmin = false;
  isUser = false;
  isEmployee = false;

  constructor(
    private loginService: LoginService,
    private sportEventService: SportEventService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.assignCurrentUser();
    this.getSportEvents();
    this.commonServiceSubscription = this.commonService
      .getUpdateSubject()
      .subscribe((updatedData) => {
        // update the sportEvent array with the new data
        console.log('updatedData', updatedData);
        this.sportEvents = updatedData as SportEvent[];
        this.filteredSportEvents = updatedData as SportEvent[];
      });
  }

  ngOnDestroy(): void {
    this.getAllSportEventsSubscription?.unsubscribe();
    this.deleteSportEventSubscription?.unsubscribe();
    this.getRecommendedSportEventsSubscription?.unsubscribe();
    this.getEnrolledSportEventsSubscription?.unsubscribe();
    this.getHostedSportEventsSubscription?.unsubscribe();
    this.commonServiceSubscription?.unsubscribe();
  }

  ///////////////////////////////////////////////////////////
  //////////       Get sportevents functionality      ///////
  ///////////////////////////////////////////////////////////

  //get all sportevents
  getSportEvents() {
    this.getAllSportEventsSubscription = this.sportEventService
      .getAllSportEvents()
      .subscribe({
        next: (v) => {
          this.sportEvents = v;
          this.filteredSportEvents = v;
          this.recommendationIsShowing = false;
          this.enrolledSportEventsIsShowing = false;
          this.hostedSportEventsIsShowing = false;
        },
        error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
        complete: () => console.log('getting al sportevents complete (ui)'),
      });
  }

  getRecommendedSportEvents() {
    if (!this.currentUser._id) {
      SweetAlert.showErrorAlert('Er is iets fout gegaan');
      return;
    }

    this.getRecommendedSportEventsSubscription = this.sportEventService
      .getRecommendedSportEvents(this.currentUser._id)
      .subscribe({
        next: (v) => {
          this.sportEvents = v;
          this.filteredSportEvents = v;
          this.recommendationIsShowing = true;
          this.enrolledSportEventsIsShowing = false;
        },
        error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
        complete: () => console.log('getting recommended sportevents complete'),
      });
  }

  getEnrolledSportEvents() {
    if (!this.currentUser._id) {
      SweetAlert.showErrorAlert('Er is iets fout gegaan');
      return;
    }

    this.getEnrolledSportEventsSubscription = this.sportEventService
      .getSportEventsCurrentlyEnrolledIn(this.currentUser._id)
      .subscribe({
        next: (v) => {
          this.sportEvents = v;
          this.filteredSportEvents = v;
          this.recommendationIsShowing = false;
          this.enrolledSportEventsIsShowing = true;
        },
        error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
        complete: () => console.log('getting enrolled sportevents complete'),
      });
  }

  getHostedSportEvents() {
    if (!this.currentUser._id) {
      SweetAlert.showErrorAlert('Er is iets fout gegaan');
      return;
    }
    this.hostedSportEventsIsShowing = true;
    this.getHostedSportEventsSubscription = this.sportEventService
      .getHostedSportEvents(this.currentUser._id)
      .subscribe({
        next: (v) => {
          this.sportEvents = v;
          this.filteredSportEvents = v;
        },
        error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
        complete: () => console.log('getting hosted sportevents complete'),
      });
  }

  ///////////////////////////////////////////////////////////
  //////////       Search functionality      ////////////////
  ///////////////////////////////////////////////////////////

  get sportEventCity(): string {
    return this._sportEventCity;
  }

  set sportEventCity(value: string) {
    this._sportEventCity = value;
    this.filteredSportEvents = this.filterBySportEventTitleAndCity(
      this._sportEventTitle,
      this._sportEventCity
    );
  }

  get sportEventTitle(): string {
    return this._sportEventTitle;
  }

  set sportEventTitle(value: string) {
    this._sportEventTitle = value;
    this.filteredSportEvents = this.filterBySportEventTitleAndCity(
      this._sportEventTitle,
      this._sportEventCity
    );
  }

  filterBySportEventTitleAndCity(
    sportEventTitle: string,
    sportEventCity: string
  ): SportEvent[] {
    return this.sportEvents.filter(
      (sportEvent) =>
        sportEvent.title
          .toLowerCase()
          .includes(sportEventTitle.toLowerCase()) &&
        sportEvent.sportclub.address.city
          .toLowerCase()
          .includes(sportEventCity.toLowerCase())
    );
  }

  ///////////////////////////////////////////////////////////
  //////////       Delete functionality      ////////////////
  ///////////////////////////////////////////////////////////

  deleteSportEvent(sportEventId: string | undefined) {
    if (!sportEventId) {
      SweetAlert.showErrorAlert('Er gaat iets mis, probeer het opnieuw..');
      return;
    }

    this.deleteSportEventSubscription = this.sportEventService
      .deleteSportEvent(sportEventId)
      .subscribe({
        next: () => {
          this.sportEvents = this.sportEvents.filter(
            (sportEvent) => sportEvent._id !== sportEventId
          );
          this.filteredSportEvents = this.filteredSportEvents.filter(
            (sportEvent) => sportEvent._id !== sportEventId
          );
          SweetAlert.showSuccessAlert('Evenement verwijderd!');
        },
        error: (e) => SweetAlert.showErrorAlert(e.error.message),
        complete: () => console.log('delete sportevent complete (ui)'),
      });
  }

  //custom confirmation for deleting a user
  sweetAlertDeleteConfirmation(userId: string | undefined) {
    console.log(
      'sweetAlertDeleteConfirmation called from user-list.component.ts'
    );
    Swal.fire({
      title: 'pas op!	',
      text: 'Weet je zeker dat je deze gebruiker wilt verwijderen?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Verwijderen',
      cancelButtonText: 'Annuleren',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteSportEvent(userId);
      }
    });
  }

  ///////////////////////////////////////////////////////////
  /////////////       Check current user data   /////////////
  ///////////////////////////////////////////////////////////

  private assignCurrentUser() {
    if (this.loginService.currentUser) {
      this.currentUser = this.loginService.currentUser;
      this.currentUserHasRoleAdmin();
      this.currentUserHasRoleUser();
      this.currentUserHasRoleEmployee();
    }
  }

  private currentUserHasRoleUser(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.User)) {
      this.isUser = true;
    } else {
      this.isUser = false;
    }
  }

  private currentUserHasRoleAdmin(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.Admin)) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }

  private currentUserHasRoleEmployee(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.Employee)) {
      this.isEmployee = true;
    } else {
      this.isEmployee = false;
    }
  }
}
