import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Address, Role, Sportclub, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
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

  constructor(
    private registerService: RegisterService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

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
        console.log('register component next');
        console.log(v);
        this.router.navigate(['login']);
        Swal.fire({
          title: 'Succes',
          text: 'Account succesvol aangemaakt',
          icon: 'success',
          confirmButtonText: 'Sluiten',
        });
      },
      error: () =>
        Swal.fire({
          title: 'Oops...',
          text: 'Email is mogelijk al in gebruik',
          icon: 'error',
          confirmButtonText: 'Sluiten',
        }),
      complete: () => console.log('register complete'),
    });
  }
}
