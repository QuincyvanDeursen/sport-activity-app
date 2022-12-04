import { Component, OnInit } from '@angular/core';
import { Role, User } from '@sport-activity-app/domain';

@Component({
  selector: 'sport-activity-app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  newUser: User = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    city: '',
    roles: [],
  };

  constructor() {}

  ngOnInit(): void {}

  register() {
    console.log('register user called');
    console.log(this.newUser);
  }
}
