import { Route } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SportEventColumnsComponent } from './pages/sport-event/sport-event-columns/sport-event-columns.component';
import { SportEventDetailComponent } from './pages/sport-event/sport-event-detail/sport-event-detail.component';
import { SportEventListComponent } from './pages/sport-event/sport-event-list/sport-event-list.component';
import { AccountSettingsComponent } from './pages/user/account-settings/account-settings.component';
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
