import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role, User } from '@sport-activity-app/domain';
import { LoginService } from '../../login/login.service';
import { UserService } from '../user.service';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sport-activity-app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css'],
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  updateAccountSettingsSubscription?: Subscription;
  loginSubscription?: Subscription;

  newUserData!: User;
  isUser = true;
  isEmployee = false;

  /////////////////////////////////////////
  ///////////////  Lifecycle    ///////////
  /////////////////////////////////////////

  constructor(
    private loginService: LoginService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.assignUserData();
  }

  ngOnDestroy() {
    console.log('account settings component destroyed');
    if (this.updateAccountSettingsSubscription) {
      this.updateAccountSettingsSubscription.unsubscribe();
    }
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  /////////////////////////////////////////
  ///////////////  methods      ///////////
  /////////////////////////////////////////

  public updateAccountSettings(): void {
    console.log('update account settings');
    this.userService.updateAccountSettings(this.newUserData).subscribe({
      next: (v) => {
        SweetAlert.showSuccessAlert('Je account is succesvol aangepast!');
        this.refreshCurrentUser();
      },
      error: (e) => SweetAlert.showErrorAlert(e.error.message),
      complete: () => console.log('update account settings complete (ui)'),
    });
  }

  public switchForm(): void {
    this.isUser = !this.isUser;
  }

  /////////////////////////////////////////
  ///////////////  User data      /////////
  /////////////////////////////////////////
  private assignUserData(): void {
    if (this.loginService.currentUser) {
      this.newUserData = { ...this.loginService.currentUser };
      this.hasRoleEmployee();
      this.newUserData.password =
        this.loginService.userIdentityStored?.password || '';
    }
  }

  private hasRoleEmployee(): void {
    if (this.newUserData && this.newUserData.roles.includes(Role.Employee)) {
      this.isEmployee = true;
    }
  }

  private refreshCurrentUser(): void {
    const identity = {
      username: this.newUserData.email,
      password: this.newUserData.password,
    };
    this.loginSubscription = this.loginService.login(identity).subscribe({
      next: () => {
        this.assignUserData();
      },
      error: () =>
        SweetAlert.showErrorAlert('Ongeldig email en wachtwoord combinatie'),
      complete: () => {
        console.log('login complete'), this.router.navigate(['/']);
      },
    });
  }
}
