import { Component, OnInit } from '@angular/core';
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

  getCurrentUser() {
    return this.loginService.currentUser;
  }
}
