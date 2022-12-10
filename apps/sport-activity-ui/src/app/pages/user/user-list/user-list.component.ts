import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { LoginService } from '../../login/login.service';
import { UserService } from '../user.service';

@Component({
  selector: 'sport-activity-app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = this.users;
  subscription?: Subscription;
  private _firstNameSearchTerm = '';
  private _lastNameSearchTerm = '';

  get firstNameSearchTerm(): string {
    return this._firstNameSearchTerm;
  }

  set firstNameSearchTerm(value: string) {
    this._firstNameSearchTerm = value;
    this.filteredUsers = this.filterUserByFirstNameAndLastName(
      this._firstNameSearchTerm,
      this._lastNameSearchTerm
    );
  }

  get lastNameSearchTerm(): string {
    return this._lastNameSearchTerm;
  }

  set lastNameSearchTerm(value: string) {
    this._lastNameSearchTerm = value;
    this.filteredUsers = this.filterUserByFirstNameAndLastName(
      this._firstNameSearchTerm,
      this._lastNameSearchTerm
    );
  }

  constructor(
    private userService: UserService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.getUsers();
    console.log(this.users);
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    console.log('user-list.component.ts destroyed');
  }

  getUsers() {
    this.subscription = this.userService.getAllUsers().subscribe({
      next: (v) => {
        this.users = v;
        this.filteredUsers = v;
      },
      error: () => SweetAlert.showErrorAlert('Er is iets fout gegaan'),
      complete: () => console.log('getting al users complete (ui)'),
    });
  }

  filterUserByFirstNameAndLastName(firstName: string, lastName: string) {
    return this.users.filter(
      (user) =>
        user.firstName.toLowerCase().indexOf(firstName.toLowerCase()) !== -1 &&
        user.lastName.toLowerCase().indexOf(lastName.toLowerCase()) !== -1
    );
  }

  isLoggedIn(): boolean {
    return this.loginService.loggedIn();
  }

  isUser(): boolean {
    return this.loginService.currentUser.roles?.includes(Role.User);
  }

  //follow a user
  followUser(userToFollowId: string | undefined) {
    console.log('followUser called from user-list.component.ts');
    const currentUserId = this.loginService.currentUser._id;

    if (currentUserId === undefined || userToFollowId === undefined) {
      SweetAlert.showErrorAlert('Er gaat iets mis, probeer het opnieuw..');
      return;
    }
    if (currentUserId === userToFollowId) {
      SweetAlert.showErrorAlert('Je kan jezelf niet volgen');
      return;
    }
    if (
      this.loginService.currentUser.followingUsers?.includes(userToFollowId)
    ) {
      SweetAlert.showErrorAlert('Je volgt deze gebruiker al');
      return;
    }

    this.userService
      .followUser({
        currentUserId,
        userToFollowId,
      })
      .subscribe({
        next: (v) => {
          this.loginService.currentUser.followingUsers?.push(userToFollowId);
          SweetAlert.showSuccessAlert('Je volgt deze gebruiker nu!');
        },
        error: () =>
          SweetAlert.showErrorAlert(
            'Er is iets fout gegaan, probeer het opnieuw..'
          ),
        complete: () => console.log('follow user complete (ui)'),
      });
  }
}
