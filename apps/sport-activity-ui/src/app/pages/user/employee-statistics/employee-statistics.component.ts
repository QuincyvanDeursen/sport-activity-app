import { Component, OnInit } from '@angular/core';
import { Role, User } from '@sport-activity-app/domain';
import { Subscription } from 'rxjs';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { LoginService } from '../../login/login.service';
import { UserService } from '../user.service';

@Component({
  selector: 'sport-activity-app-employee-statistics',
  templateUrl: './employee-statistics.component.html',
  styleUrls: ['./employee-statistics.component.css'],
})
export class EmployeeStatisticsComponent implements OnInit {
  currentUser?: User;
  isEmployee = false;
  isAdmin = false;

  statisticsSubscription?: Subscription;

  dashboard = {
    avgIncome: 0,
    avgParticipants: 0,
    avgPrice: 0,
    avgDuration: 0,
    maxDuration: 0,
    maxIncome: 0,
    maxParticipants: 0,
    maxPrice: 0,
    minDuration: 0,
    minIncome: 0,
    minParticipants: 0,
    minPrice: 0,
    totalCompletedEvents: 0,
    totalEarnedIncome: 0,
    totalEvents: 0,
    totalIncome: 0,
    totalParticipants: 0,
    potentialIncome: 0,
  };

  constructor(
    private userService: UserService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.assignCurrentUser();
    if (this.currentUser?._id && this.isEmployee) {
      this.getEmployeeStatsById(this.currentUser._id);
    }
  }

  /////////////////////////////////////
  ////// Get employee stats //////////
  /////////////////////////////////////

  //get employee stats by id request
  getEmployeeStatsById(userId: string): void {
    this.statisticsSubscription = this.userService
      .getEmployeeStatistics(userId)
      .subscribe({
        next: (v) => {
          this.dashboard = v[0];
          console.log(this.dashboard);
        },
        error: () => SweetAlert.showErrorAlert('Probeer opnieuw in te loggen.'),
      });
  }

  ///////////////////////////////////////////////////////////
  ////////////////       Current user      //////////////////
  ///////////////////////////////////////////////////////////

  private currentUserHasRoleEmployee(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.Employee)) {
      this.isEmployee = true;
    } else {
      this.isEmployee = false;
    }
  }

  private currentUserHasRoleAdmin(): void {
    if (this.currentUser && this.currentUser.roles?.includes(Role.Admin)) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }

  private assignCurrentUser() {
    if (this.loginService.currentUser) {
      this.currentUser = this.loginService.currentUser;
      this.currentUserHasRoleEmployee();
      this.currentUserHasRoleAdmin();
    }
  }
}
