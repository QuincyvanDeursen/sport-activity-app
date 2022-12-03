import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Identity } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import { LoginService } from './login.service';

@Component({
  selector: 'sport-activity-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  identity: Identity = {
    username: '',
    password: '',
  };

  subscription!: Subscription;

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {}

  login() {
    this.subscription = this.loginService.login(this.identity).subscribe({
      next: (v) => {
        console.log(v),
          localStorage.setItem('token', v.access_token),
          this.router.navigate(['/']);
      },
      error: (e) => console.error(e),
      complete: () => console.log('login complete'),
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    console.log('login component destroyed');
  }
}
