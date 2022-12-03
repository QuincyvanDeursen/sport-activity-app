import { Route } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
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
];
