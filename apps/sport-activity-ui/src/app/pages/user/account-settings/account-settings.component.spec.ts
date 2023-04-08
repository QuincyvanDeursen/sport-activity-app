import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { AccountSettingsComponent } from './account-settings.component';
import { UserService } from '../user.service';
import { SweetAlert } from '../../../shared/HelperMethods/SweetAlert';
import { Role } from '@sport-activity-app/domain';

describe('registerComponent', () => {
  let component: AccountSettingsComponent;
  let fixture: ComponentFixture<AccountSettingsComponent>;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountSettingsComponent],
      imports: [FormsModule, HttpClientTestingModule],
    }).compileComponents();
    userService = TestBed.inject(UserService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('updateUser', () => {
    it('should call update for when update button is clicked', () => {
      const newUser = {
        email: 'new@gmail.com',
        password: 'Secret123!',
        firstName: 'Quincy',
        lastName: 'van Deursen',
        city: 'BREDA',
        roles: [Role.User],
      };

      component.newUserData = newUser;

      const sweetAlertSpy = jest.spyOn(SweetAlert, 'showSuccessAlert');
      const userServiceSpy = jest
        .spyOn(userService, 'updateAccountSettings')
        .mockReturnValueOnce(of({}));

      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const button = compiled.querySelector('.customupdatebutton');
      button.click();

      // check if the register method of the registerService is called
      expect(userServiceSpy).toHaveBeenCalledTimes(1);
      expect(sweetAlertSpy).toHaveBeenCalledWith(
        'Je account is succesvol aangepast!'
      );
    });

    it('should show error when error occurs.', () => {
      const newUser = {
        email: 'new@gmail.com',
        password: 'Secret123!',
        firstName: 'Quincy',
        lastName: 'van Deursen',
        city: 'BREDA',
        roles: [Role.User],
      };

      component.newUserData = newUser;

      const sweetAlertSpy = jest.spyOn(SweetAlert, 'showErrorAlert');
      const userServiceSpy = jest
        .spyOn(userService, 'updateAccountSettings')
        .mockReturnValueOnce(throwError({ error: { message: 'Een error.' } }));

      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const button = compiled.querySelector('.customupdatebutton');
      button.click();

      expect(userServiceSpy).toHaveBeenCalledTimes(1);
      expect(sweetAlertSpy).toHaveBeenCalledWith('Een error.');
    });

    it('should disable button when not all data is provided.', () => {
      const newUser = {
        email: 'new@gmail.com',
        password: 'Secret123!',
        firstName: '',
        lastName: 'van Deursen',
        city: 'BREDA',
        roles: [Role.User],
      };

      component.newUserData = newUser;

      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const button = compiled.querySelector('.customupdatebutton');
      const firstnameinput = compiled.querySelector('.firstnameinput');
      firstnameinput.value = '';
      firstnameinput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(button.disabled).toBeTruthy();
    });
  });
});
