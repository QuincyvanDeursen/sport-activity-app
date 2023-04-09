import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user/user.service';
import { Role, SportEvent, User } from '@sport-activity-app/domain';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { ActivatedRoute, Router } from '@angular/router';
import { SportEventService } from '../../sport-event/sport-event.service';
import Swal from 'sweetalert2';
import { CommonService } from '../../../shared/HelperMethods/common.service';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'sport-activity-app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css'],
})
export class EmployeeDetailComponent implements OnInit {
  employee!: User;
  employeeId?: string | null;
  sportEvents: SportEvent[] = [];
  isAdmin = false;

  constructor(
    private userSerivce: UserService,
    private route: ActivatedRoute,
    private sportEventService: SportEventService,
    private commonService: CommonService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.getUserById(this.employeeId);
        this.getSportEventsByEmployeeId(this.employeeId);
      }
    });
    this.currentUserIsAdmin();
  }

  private getUserById(id: string) {
    this.userSerivce.getUserById(id).subscribe({
      next: (v) => {
        console.log(v);
        this.employee = v;
      },
      error: (e) => {
        SweetAlert.showErrorAlert('Er is iets fout gegaan: ' + e);
      },
      complete: () => {
        console.log('complete');
      },
    });
  }

  private getSportEventsByEmployeeId(id: string) {
    this.sportEventService.getHostedSportEvents(id).subscribe({
      next: (v) => {
        console.log(v);
        this.sportEvents = v;
      },
      error: (e) => {
        SweetAlert.showErrorAlert('Er is iets fout gegaan: ' + e);
      },
      complete: () => {
        console.log('complete');
      },
    });
  }

  private deleteEmployee() {
    if (!this.employeeId) {
      SweetAlert.showErrorAlert('Er is iets fout gegaan');
      return;
    }
    this.userSerivce.deleteUser(this.employeeId).subscribe({
      next: (v) => {
        console.log(v);
        SweetAlert.showSuccessAlert('De medewerker is verwijderd!');
        this.commonService.updateUserList();
      },
      error: (e) => {
        SweetAlert.showErrorAlert('Er is iets fout gegaan: ' + e);
      },
      complete: () => {
        console.log('completed');
      },
    });
  }

  //custom confirmation for deleting a user
  sweetAlertDeleteConfirmation() {
    console.log(
      'sweetAlertDeleteConfirmation called from user-list.component.ts'
    );
    Swal.fire({
      title: 'pas op!	',
      text: 'Weet je zeker dat je deze gebruiker wilt verwijderen? Zijn sportschool en evenementen worden ook verwijderd.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Verwijderen',
      cancelButtonText: 'Annuleren',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteEmployee();
        this.router.navigate(['/employees']);
      }
    });
  }

  private currentUserIsAdmin(): void {
    if (this.loginService.currentUser) {
      this.isAdmin = this.loginService.currentUser?.roles.includes(Role.Admin);
    }
  }
}
