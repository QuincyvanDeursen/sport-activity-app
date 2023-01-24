import { Component, OnInit } from '@angular/core';
import { Role, User } from '@sport-activity-app/domain';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'sport-activity-app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css'],
})
export class AccountSettingsComponent implements OnInit {
  currentUser!: User;
  isAccountForm = true;
  isEmployee = false;

  /////////////////////////////////////////
  ///////////////  Lifecycle    ///////////
  /////////////////////////////////////////

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.assignUserData();
  }

  /////////////////////////////////////////
  ///////////////  methods      ///////////
  /////////////////////////////////////////

  public updateAccountSettings(): void {
    console.log('Button clicked');
  }

  public switchForm(): void {
    this.isAccountForm = !this.isAccountForm;
  }

  /////////////////////////////////////////
  ///////////////  User data      /////////
  /////////////////////////////////////////
  private assignUserData(): void {
    if (this.loginService.currentUser) {
      this.currentUser = this.loginService.currentUser;
      this.hasRoleEmployee();
    }
  }

  private hasRoleEmployee(): void {
    if (this.currentUser && this.currentUser.roles.includes(Role.Employee)) {
      this.isEmployee = true;
    }
  }
}
