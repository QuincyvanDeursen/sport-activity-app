import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role, SportEvent, User } from '@sport-activity-app/domain';
import { Subject } from 'rxjs';
import { LoginService } from '../../login/login.service';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'sport-activity-app-sport-event-create',
  templateUrl: './sport-event-create.component.html',
  styleUrls: ['./sport-event-create.component.css'],
})
export class SportEventCreateComponent implements OnInit, OnDestroy {
  //current user data
  currentUser!: User;
  isEmployee = false;
  constructor(private loginService: LoginService) {}

  //input change listeners
  titleChanged = new Subject<string>();
  descriptionChanged = new Subject<string>();
  priceChanged = new Subject<number>();
  startDateAndTimeChanged = new Subject<Date>();
  durationInMinutesChanged = new Subject<number>();
  maximumNumberOfParticipantsChanged = new Subject<number>();
  private readonly destroy$ = new Subject<void>();

  //sportevent data
  newSportEvent: SportEvent = {
    title: '',
    description: '',
    price: -1,
    startDateAndTime: new Date(),
    durationInMinutes: -1,
    maximumNumberOfParticipants: -1,
    hostId: '',
    sportclub: {
      clubName: '',
      websiteURL: '',
      email: '',
      phoneNumber: '',
      address: {
        city: '',
        zipCode: '',
        street: '',
        houseNumber: '',
      },
    },
  };

  htmlStartDateAndTime?: string;

  //////////////////////////////////////////////
  /////////    Angular Lifecycle   /////////////
  //////////////////////////////////////////////

  ngOnInit(): void {
    this.assignCurrentUser();
    this.titleChanged
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.setTitle(val);
      });

    this.descriptionChanged
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.setDescription(val);
      });

    this.priceChanged
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.setPrice(val);
      });

    this.startDateAndTimeChanged
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.setStartDateAndTime(val);
      });

    this.durationInMinutesChanged
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.setDurationInMinutes(val);
      });

    this.maximumNumberOfParticipantsChanged
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((val) => {
        this.setMaximumNumberOfParticipants(val);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //////////////////////////////////////////////
  /////////    Create SportEvent   /////////////
  //////////////////////////////////////////////

  //
  createSportEvent() {
    console.log('createSportEvent called in sport-event-create.component.ts');
    this.completeNewSportEvent();
  }

  // completing the newSportEvent object
  completeNewSportEvent() {
    if (this.currentUser._id && this.currentUser.sportclub) {
      this.newSportEvent.hostId = this.currentUser._id;
      this.newSportEvent.sportclub = this.currentUser.sportclub;
    }
    console.log(this.newSportEvent);
  }

  setTitle(title: string) {
    this.newSportEvent.title = title;
  }

  setDescription(description: string) {
    this.newSportEvent.description = description;
  }

  setPrice(price: number) {
    this.newSportEvent.price = price;
  }

  setStartDateAndTime(startDateAndTime: Date) {
    this.newSportEvent.startDateAndTime = startDateAndTime;
  }

  setDurationInMinutes(durationInMinutes: number) {
    this.newSportEvent.durationInMinutes = durationInMinutes;
  }

  setMaximumNumberOfParticipants(maximumNumberOfParticipants: number) {
    this.newSportEvent.maximumNumberOfParticipants =
      maximumNumberOfParticipants;
  }

  ///////////////////////////////////////////////////////////
  /////////       Check current user data   ////////////////
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
