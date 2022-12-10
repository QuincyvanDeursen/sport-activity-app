import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import { LoginService } from './login.service';
import { SweetAlert } from '../../shared/HelperMethods/SweetAlert';

@Component({
  selector: 'sport-activity-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  identity = {
    username: '',
    password: '',
  };

  curentUser!: User;

  subscription!: Subscription;

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {}

  login() {
    this.subscription = this.loginService.login(this.identity).subscribe({
      next: (v) => {
        console.log('login component next');
        console.log(v);
        this.router.navigate(['/']);
      },
      error: () =>
        SweetAlert.showErrorAlert('Ongeldig email en wachtwoord combinatie'),

      complete: () => console.log('login complete'),
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    console.log('login component destroyed');
  }
}
