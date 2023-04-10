import { Component, OnInit } from '@angular/core';
import { SportEventService } from '../sport-event.service';

import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../../login/login.service';
import { Role, User } from '@sport-activity-app/domain';

@Component({
  selector: 'sport-activity-app-guestlist',
  templateUrl: './guestlist.component.html',
  styleUrls: ['./guestlist.component.css'],
})
export class GuestlistComponent implements OnInit {
  guestList!: any[];
  isEmployee = false;
  isAdmin = false;
  currentUser?: User;
  sportEventId!: string | null;
  constructor(
    private sportEventService: SportEventService,
    private route: ActivatedRoute,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.assignCurrentUser();
    this.route.paramMap.subscribe((params) => {
      this.sportEventId = params.get('id');
      if (this.sportEventId) {
        this.getGuestList(this.sportEventId);
      }
    });
  }

  private getGuestList(id: string) {
    this.sportEventService.getGuestlistForSportEvent(id).subscribe({
      next: (v) => {
        this.guestList = v.enrolledParticipants;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  changeButtonColor() {
    const checkbox = document.getElementById(
      'btn-check-outlined'
    ) as HTMLInputElement;
    const label = document.querySelector(
      'label[for="btn-check-outlined"]'
    ) as HTMLLabelElement;
    checkbox.addEventListener('click', () => {
      if (checkbox.checked) {
        label.classList.add('btn-outline-success');
        label.classList.remove('btn-outline-warning');
        label.textContent = 'Aanwezig!';
      } else {
        label.classList.add('btn-outline-warning');
        label.classList.remove('btn-outline-success');
        label.textContent = 'Afwezig';
      }
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

  private assignCurrentUser() {
    if (this.loginService.currentUser) {
      this.currentUser = this.loginService.currentUser;
      this.currentUserHasRoleEmployee();
      this.currentUserHasRoleAdmin();
    }
  }
}
