import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@sport-activity-app/domain';
import { BehaviorSubject } from 'rxjs';
import { LoginService } from '../../pages/login/login.service';

@Component({
  selector: 'sport-activity-app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  public isMenuCollapsed = true;
  loggedInUser?: BehaviorSubject<User | undefined>;

  /////////////////////////////////////////
  ///////////////  Lifecycle    ///////////
  /////////////////////////////////////////

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    console.log('navbar component init');
    this.loggedInUser = this.loginService.isLoggedIn;
  }

  /////////////////////////////////////////
  ///////////////  methods      ///////////
  /////////////////////////////////////////

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
    console.log('logged out');
  }
}
