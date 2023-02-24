import { Route } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
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
    path: 'accountsettings',
    pathMatch: 'full',
    component: AccountSettingsComponent,
  },
];
