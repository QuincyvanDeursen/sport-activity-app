import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'sport-activity-app-employee-columns',
  templateUrl: './employee-columns.component.html',
  styleUrls: ['./employee-columns.component.css'],
})
export class EmployeeColumnsComponent implements OnInit {
  userIsLoggedIn = false;

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    if (this.loginService.currentUser) {
      this.userIsLoggedIn = true;
    }
  }
}
