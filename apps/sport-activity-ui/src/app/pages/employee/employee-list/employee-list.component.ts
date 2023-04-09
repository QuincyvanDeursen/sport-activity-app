import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../user/user.service';
import { User } from '@sport-activity-app/domain';
import { CommonService } from '../../../shared/HelperMethods/common.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sport-activity-app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: User[] = [];

  employeeSubscription?: Subscription;

  private _clubName = '';
  private _sportEventCity = '';
  filteredEmployees: User[] = this.employees;

  constructor(
    private userService: UserService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.getAllEmployees();
    this.commonService.getUpdateSubject().subscribe((updatedData) => {
      // update the employees array with the new data
      this.filteredEmployees = updatedData as User[];
      this.employees = updatedData as User[];
    });
  }

  ngOnDestroy(): void {
    if (this.employeeSubscription) {
      this.employeeSubscription.unsubscribe();
    }
  }

  //////////////////////////////////////
  /////////// GET ALL EMPLOYEES ////////
  //////////////////////////////////////

  private getAllEmployees() {
    this.userService.getAllEmployees().subscribe({
      next: (v) => {
        this.employees = v;
        this.filteredEmployees = v;
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => {
        console.log('complete');
      },
    });
  }

  //////////////////////////////////////
  //////// Search Functionlity     /////
  //////////////////////////////////////

  get sportEventCity(): string {
    return this._sportEventCity;
  }

  set sportEventCity(value: string) {
    this._sportEventCity = value;
    this.filteredEmployees = this.filterBySportEventTitleAndCity(
      this._clubName,
      this._sportEventCity
    );
  }

  get clubName(): string {
    return this._clubName;
  }

  set clubName(value: string) {
    this._clubName = value;
    this.filteredEmployees = this.filterBySportEventTitleAndCity(
      this._clubName,
      this._sportEventCity
    );
  }

  filterBySportEventTitleAndCity(
    clubName: string,
    sportEventCity: string
  ): User[] {
    return this.employees.filter(
      (employee) =>
        employee.sportclub?.clubName
          .toLowerCase()
          .includes(clubName.toLowerCase()) &&
        employee.sportclub.address.city
          .toLowerCase()
          .includes(sportEventCity.toLowerCase())
    );
  }
}
