import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoginService } from '../../pages/login/login.service';

@Component({
  selector: 'sport-activity-app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  public isMenuCollapsed = true;
  isLoggedIn?: BehaviorSubject<boolean | undefined>;

  /////////////////////////////////////////
  ///////////////  Lifecycle    ///////////
  /////////////////////////////////////////

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    console.log('navbar component init');
    this.isLoggedIn = this.loginService.isLoggedIn;
  }

  /////////////////////////////////////////
  ///////////////  methods      ///////////
  /////////////////////////////////////////

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
    console.log('logged out');
  }

  /////////////////////////////////////////
  ///////////////  Getters  ///////////////
  /////////////////////////////////////////

  get currentUsername(): string {
    return this.loginService.currentUser.firstName;
  }
}
