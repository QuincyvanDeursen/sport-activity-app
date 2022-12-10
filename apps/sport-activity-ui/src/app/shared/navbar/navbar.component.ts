import { Component, OnInit } from '@angular/core';
import { User } from '@sport-activity-app/domain';
import { LoginService } from '../../pages/login/login.service';

@Component({
  selector: 'sport-activity-app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  public isMenuCollapsed = true;

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    console.log('navbar component init');
  }

  loggedIn(): boolean {
    return this.loginService.loggedIn();
  }

  logout(): void {
    this.loginService.logout();
  }

  get currentUsername(): string {
    return this.loginService.currentUser.firstName;
  }
}
