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

  constructor(private loginSerivce: LoginService) {}

  ngOnInit(): void {
    this.currentUser = this.loginSerivce.currentUser;
  }

  public hasRoleEmployee(): boolean {
    return this.currentUser.roles.includes(Role.Employee);
  }

  public updateAccountSettings(): void {
    console.log('Button clicked');
  }

  public switchForm(): void {
    this.isAccountForm = !this.isAccountForm;
  }
}
