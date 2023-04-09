import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { IntroductionComponent } from './shared/introduction/introduction.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { TokenInterceptorService } from './interceptors/token-interceptor.service';
import { AccountSettingsComponent } from './pages/user/account-settings/account-settings.component';
import { IncludesPipe } from './CustomPipes/IncludePipe';
import { SportEventListComponent } from './pages/sport-event/sport-event-list/sport-event-list.component';
import { SportEventDetailComponent } from './pages/sport-event/sport-event-detail/sport-event-detail.component';
import { SportEventColumnsComponent } from './pages/sport-event/sport-event-columns/sport-event-columns.component';
import { SportEventCreateComponent } from './pages/sport-event/sport-event-create/sport-event-create.component';
import { SportEventUpdateComponent } from './pages/sport-event/sport-event-update/sport-event-update.component';
import { EmployeeStatisticsComponent } from './pages/user/employee-statistics/employee-statistics.component';
import { AboutComponent } from './pages/about/about.component';
import { EmployeeColumnsComponent } from './pages/employee/employee-columns/employee-columns.component';
import { EmployeeDetailComponent } from './pages/employee/employee-detail/employee-detail.component';
import { EmployeeListComponent } from './pages/employee/employee-list/employee-list.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    IntroductionComponent,
    RegisterComponent,
    LoginComponent,
    UserListComponent,
    AccountSettingsComponent,
    IncludesPipe,
    SportEventListComponent,
    SportEventDetailComponent,
    SportEventColumnsComponent,
    SportEventCreateComponent,
    SportEventUpdateComponent,
    EmployeeStatisticsComponent,
    AboutComponent,
    EmployeeColumnsComponent,
    EmployeeDetailComponent,
    EmployeeListComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    NgbModule,
    FormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
