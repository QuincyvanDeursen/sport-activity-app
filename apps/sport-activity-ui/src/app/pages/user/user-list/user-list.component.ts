import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { log } from 'util';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { LoginService } from '../../login/login.service';
import { UserService } from '../user.service';

@Component({
  selector: 'sport-activity-app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy {
  //user list
  users: User[] = [];
  filteredUsers: User[] = this.users;
  subscription?: Subscription;
  private _firstNameSearchTerm = '';
  private _lastNameSearchTerm = '';

  //current user data
  currentUser = this.loginService.currentUser;
  isAdmin!: boolean;
  isUser!: boolean;

  constructor(
    private userService: UserService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.currentUserIsLoggedIn();
    this.currentUserHasRoleAdmin();
    this.currentUserHasRoleUser();
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    this.isAdmin = false;
    this.isUser = false;
    console.log('user-list.component.ts destroyed');
  }

  ///////////////////////////////////////////////////////////
  //////////       Search functionality      ////////////////
  ///////////////////////////////////////////////////////////

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

  filterUserByFirstNameAndLastName(firstName: string, lastName: string) {
    return this.users.filter(
      (user) =>
        user.firstName.toLowerCase().indexOf(firstName.toLowerCase()) !== -1 &&
        user.lastName.toLowerCase().indexOf(lastName.toLowerCase()) !== -1
    );
  }

  ///////////////////////////////////////////////////////////
  //////////       Get users functionality      ////////////////
  ///////////////////////////////////////////////////////////

  //get all users
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

  ///////////////////////////////////////////////////////////
  //////////       Delete functionality      ////////////////
  ///////////////////////////////////////////////////////////

  //delete a user
  deleteUser(userId: string | undefined) {
    console.log('deleteUser called from user-list.component.ts');
    if (userId === undefined) {
      SweetAlert.showErrorAlert('Er gaat iets mis, probeer het opnieuw..');
      return;
    }
    if (this.loginService.currentUser._id === userId) {
      SweetAlert.showErrorAlert('Je kan jezelf niet verwijderen');
      return;
    }
    this.userService.deleteUser(userId).subscribe({
      next: (v) => {
        this.users = this.users.filter((user) => user._id !== userId);
        this.filteredUsers = this.filteredUsers.filter(
          (user) => user._id !== userId
        );
        SweetAlert.showSuccessAlert('Gebruiker verwijderd!');
      },
      error: (e) => SweetAlert.showErrorAlert(e.error.message),
      complete: () => console.log('delete user complete (ui)'),
    });
  }

  //custom confirmation for deleting a user
  sweetAlertDeleteConfirmation(userId: string | undefined) {
    console.log(
      'sweetAlertDeleteConfirmation called from user-list.component.ts'
    );
    Swal.fire({
      title: 'pas op!	',
      text: 'Weet je zeker dat je deze gebruiker wilt verwijderen?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Verwijderen',
      cancelButtonText: 'Annuleren',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUser(userId);
      }
    });
  }

  ///////////////////////////////////////////////////////////
  //////////       Follow functionality      ////////////////
  ///////////////////////////////////////////////////////////

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
        error: (e) => SweetAlert.showErrorAlert(e.error.message),
        complete: () => console.log('follow user complete (ui)'),
      });
  }

  //unfollow a user
  unfollowUser(userToFollowId: string | undefined) {
    console.log('unfollowUser called from user-list.component.ts');
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
        error: (e) => SweetAlert.showErrorAlert(e.error.message),
        complete: () => console.log('follow user complete (ui)'),
      });
  }

  //check if the current user already follows the other user
  isFollowing(otherUser: string | undefined): boolean {
    console.log('isFollowing called from user-list.component.ts');
    if (otherUser === undefined) {
      SweetAlert.showErrorAlert('Er gaat iets mis, probeer het opnieuw..');
      return false;
    }
    if (this.currentUser.followingUsers?.includes(otherUser)) {
      SweetAlert.showSuccessAlert('Je hebt deze gebruiker ontvolgt.');
      return true;
    }
    SweetAlert.showErrorAlert('Er gaat iets mis, probeer het opnieuw..');
    return false;
  }

  ///////////////////////////////////////////////////////////
  //////////       Check current user data   ////////////////
  ///////////////////////////////////////////////////////////

  private currentUserIsLoggedIn(): void {
    console.log('called1');
  }

  private currentUserHasRoleUser(): void {
    console.log('called2');
    if (this.currentUser && this.currentUser.roles?.includes(Role.User)) {
      this.isUser = true;
    } else {
      this.isUser = false;
    }
  }

  private currentUserHasRoleAdmin(): void {
    console.log('called3');

    if (this.currentUser && this.currentUser.roles?.includes(Role.Admin)) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }
}
