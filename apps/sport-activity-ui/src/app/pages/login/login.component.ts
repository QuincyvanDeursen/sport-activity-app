import { Component, OnInit } from '@angular/core';
import { Identity } from '@sport-activity-app/domain';

@Component({
  selector: 'sport-activity-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  identity: Identity = {
    emailAddress: '',
    password: '',
  };
  constructor() {}

  ngOnInit(): void {}

  onClickSubmit() {
    console.log(`${this.identity.emailAddress} ${this.identity.password}`);
  }
}
