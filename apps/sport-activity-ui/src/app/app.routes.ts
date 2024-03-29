import { Route } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SportEventColumnsComponent } from './pages/sport-event/sport-event-columns/sport-event-columns.component';
import { SportEventCreateComponent } from './pages/sport-event/sport-event-create/sport-event-create.component';
import { SportEventDetailComponent } from './pages/sport-event/sport-event-detail/sport-event-detail.component';
import { SportEventUpdateComponent } from './pages/sport-event/sport-event-update/sport-event-update.component';
import { AccountSettingsComponent } from './pages/user/account-settings/account-settings.component';
import { EmployeeStatisticsComponent } from './pages/user/employee-statistics/employee-statistics.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';

import { IntroductionComponent } from './shared/introduction/introduction.component';
import { AboutComponent } from './pages/about/about.component';
import { EmployeeListComponent } from './pages/employee/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './pages/employee/employee-detail/employee-detail.component';
import { EmployeeColumnsComponent } from './pages/employee/employee-columns/employee-columns.component';
import { GuestlistComponent } from './pages/sport-event/guestlist/guestlist.component';

export const appRoutes: Route[] = [
  //about
  { path: '', pathMatch: 'full', redirectTo: 'introduction' },
  {
    path: 'introduction',
    pathMatch: 'full',
    component: IntroductionComponent,
  },
  { path: 'login', pathMatch: 'full', component: LoginComponent },
  { path: 'register', pathMatch: 'full', component: RegisterComponent },
  { path: 'users', pathMatch: 'full', component: UserListComponent },
  { path: 'about', pathMatch: 'full', component: AboutComponent },
  {
    path: 'users/statistics',
    pathMatch: 'full',
    component: EmployeeStatisticsComponent,
  },
  {
    path: 'sportevents/:id/update',
    pathMatch: 'full',
    component: SportEventUpdateComponent,
  },
  {
    path: 'sportevents/:id/guestlist',
    pathMatch: 'full',
    component: GuestlistComponent,
  },
  {
    path: 'sportevents/create',
    pathMatch: 'full',
    component: SportEventCreateComponent,
  },

  {
    path: 'sportevents',
    component: SportEventColumnsComponent,
    children: [
      { path: ':id', pathMatch: 'full', component: SportEventDetailComponent },
    ],
  },
  {
    path: 'employees',
    component: EmployeeColumnsComponent,
    children: [
      { path: ':id', pathMatch: 'full', component: EmployeeDetailComponent },
    ],
  },
  {
    path: 'accountsettings',
    pathMatch: 'full',
    component: AccountSettingsComponent,
  },
];
