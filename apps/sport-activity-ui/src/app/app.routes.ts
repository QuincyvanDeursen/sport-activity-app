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
    path: 'accountsettings',
    pathMatch: 'full',
    component: AccountSettingsComponent,
  },
];
