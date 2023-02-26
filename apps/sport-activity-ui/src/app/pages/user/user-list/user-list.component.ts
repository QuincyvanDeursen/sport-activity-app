import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
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
  currentUser!: User;
  currentlyFollowing?: string[];
  isAlreadyFollowing = false;
  isAdmin = false;
  isUser = false;

  constructor(
    private userService: UserService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.assignCurrentUser();
    this.getUsers();
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
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
        console.log(v);
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
    if (this.currentUser._id === userId) {
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
    const currentUserId = this.currentUser._id;

    if (currentUserId === undefined || userToFollowId === undefined) {
      SweetAlert.showErrorAlert('Er gaat iets mis, probeer het opnieuw..');
      return;
    }
    if (currentUserId === userToFollowId) {
      SweetAlert.showErrorAlert('Je kan jezelf niet volgen');
      return;
    }
    if (this.currentUser.followingUsers?.includes(userToFollowId)) {
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
          this.currentUser.followingUsers?.push(userToFollowId);
          this.updateFollowingUsersArrayUpOnFollowing(userToFollowId);
          SweetAlert.showSuccessAlert('Je volgt deze gebruiker nu!');
        },
        error: (e) => SweetAlert.showErrorAlert(e.error.message),
        complete: () => console.log('follow user complete (ui)'),
      });
  }

  //unfollow a user
  unfollowUser(userToUnfollowId: string | undefined) {
    console.log('unfollowUser called from user-list.component.ts');
    const currentUserId = this.currentUser._id;

    if (currentUserId === undefined || userToUnfollowId === undefined) {
      SweetAlert.showErrorAlert('Er gaat iets mis, probeer het opnieuw..');
      return;
    }
    if (currentUserId === userToUnfollowId) {
      SweetAlert.showErrorAlert('Je kan jezelf niet volgen');
      return;
    }
    if (this.currentUser.followingUsers?.includes(userToUnfollowId)) {
      this.userService
        .unfollowUser({
          currentUserId,
          userToUnfollowId,
        })
        .subscribe({
          next: () => {
            this.currentUser.followingUsers = this.currentlyFollowing?.filter(
              (id) => id !== userToUnfollowId
            );

            this.currentlyFollowing = this.currentlyFollowing?.filter(
              (id) => id !== userToUnfollowId
            );
            SweetAlert.showSuccessAlert('Je volgt deze gebruiker niet meer!');
          },
          error: (e) => SweetAlert.showErrorAlert(e.error.message),
          complete: () => console.log('unfollow user complete (ui)'),
        });
    }
  }

  //this method is needed to trigger change detection for the include pipe.
  //this will cause the unfollow button to appear after following a user
  private updateFollowingUsersArrayUpOnFollowing(userToFollowId: string) {
    if (this.currentlyFollowing !== undefined) {
      this.currentlyFollowing = [...this.currentlyFollowing, userToFollowId];
    }
  }

  ///////////////////////////////////////////////////////////
  //////////       Check current user data   ////////////////
  ///////////////////////////////////////////////////////////

  private assignCurrentUser() {
    if (this.loginService.currentUser) {
      this.currentUser = this.loginService.currentUser;
      this.currentUserHasRoleAdmin();
      this.currentUserHasRoleUser();
      this.currentlyFollowing = this.currentUser.followingUsers;
    }
  }

  private currentUserHasRoleUser(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.User)) {
      this.isUser = true;
    } else {
      this.isUser = false;
    }
  }

  private currentUserHasRoleAdmin(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.Admin)) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }
}
