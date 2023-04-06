import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role, Sportclub, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import { SweetAlert } from '../../shared/HelperMethods/SweetAlert';
import { RegisterService } from './register.service';

@Component({
  selector: 'sport-activity-app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  isEmployee = false;
  subscription!: Subscription;
  newUser: User = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    city: '',
    roles: [],
    sportclub: undefined,
  };

  newSportclub: Sportclub = {
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
  };

  /////////////////////////////////////////////////
  //////////       Lifecycle      ////////////////
  /////////////////////////////////////////////////

  constructor(
    private registerService: RegisterService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    console.log('register component destroyed');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /////////////////////////////////////////////////
  //////////       Methods         ////////////////
  /////////////////////////////////////////////////

  //register a user
  register() {
    if (this.isEmployee) {
      this.newUser.roles.push(Role.Employee);
      this.newUser.sportclub = this.newSportclub;
    } else {
      this.newUser.roles.push(Role.User);
    }
    this.subscription = this.registerService.register(this.newUser).subscribe({
      next: (v) => {
        this.router.navigate(['login']);
        SweetAlert.showSuccessAlert('Account succesvol aangemaakt!');
      },
      error: (e) => SweetAlert.showErrorAlert(e.error.message),

      complete: () => console.log('register complete'),
    });
  }
}
