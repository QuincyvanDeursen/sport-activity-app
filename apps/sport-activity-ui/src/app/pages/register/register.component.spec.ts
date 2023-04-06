import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { RegisterService } from './register.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Role, Sportclub, User } from '@sport-activity-app/domain';
import { of, throwError } from 'rxjs';

import { SweetAlert } from '../../shared/HelperMethods/SweetAlert';

describe('registerComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let registerService: RegisterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [FormsModule, HttpClientTestingModule],
    }).compileComponents();
    registerService = TestBed.inject(RegisterService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('registerUser', () => {
    it('should call register service with correct user object for normal user', () => {
      // arrange
      component.isEmployee = false;
      const newUser: User = {
        email: 'new@gmail.com',
        password: 'Secret123!',
        firstName: 'Quincy',
        lastName: 'van Deursen',
        city: 'BREDA',
        roles: [],
      };
      component.newUser = newUser;
      const sweetAlertSpy = jest.spyOn(SweetAlert, 'showSuccessAlert');
      jest.spyOn(registerService, 'register').mockReturnValueOnce(of({}));

      // act
      component.register();

      // assert

      expect(component.newUser.roles).toEqual([Role.User]);
      expect(registerService.register).toHaveBeenCalledWith(newUser);
      expect(sweetAlertSpy).toHaveBeenCalled();
    });

    it('should call register service with correct user object for employee', () => {
      // arrange
      component.isEmployee = true;
      const newSportclub: Sportclub = {
        clubName: 'Test sportclub',
        email: 'test@gmail.com',
        websiteURL: 'www.test.com',
        phoneNumber: '0612345678',
        address: {
          city: 'BREDA',
          zipCode: '1234AB',
          street: 'Teststreet',
          houseNumber: '1',
        },
      };
      component.newSportclub = newSportclub;
      const newUser: User = {
        email: 'new@gmail.com',
        password: 'Secret123!',
        firstName: 'Quincy',
        lastName: 'van Deursen',
        city: 'BREDA',
        roles: [],
      };
      component.newUser = newUser;
      const sweetAlertSpy = jest.spyOn(SweetAlert, 'showSuccessAlert');
      jest.spyOn(registerService, 'register').mockReturnValueOnce(of({}));

      // act
      component.register();

      // assert
      expect(component.newUser.roles).toEqual([Role.Employee]);
      expect(component.newUser.sportclub).toEqual(newSportclub);
      expect(registerService.register).toHaveBeenCalledWith(newUser);
      expect(sweetAlertSpy).toHaveBeenCalled();
    });
    it('should call register for normal user when register button is clicked', () => {
      const newUser = {
        email: 'new@gmail.com',
        password: 'Secret123!',
        firstName: 'Quincy',
        lastName: 'van Deursen',
        city: 'BREDA',
      };

      // create a spy on the register method of the registerService
      const registerSpy = jest
        .spyOn(registerService, 'register')
        .mockReturnValueOnce(of({}));
      const sweetAlertSpy = jest.spyOn(SweetAlert, 'showSuccessAlert');

      // set values in form
      const compiled = fixture.debugElement.nativeElement;
      compiled.querySelector('.firstnameinput').value = newUser.firstName;
      compiled.querySelector('.lastnameinput').value = newUser.lastName;
      compiled.querySelector('.emailinput').value = newUser.email;
      compiled.querySelector('.passwordinput').value = newUser.password;
      compiled.querySelector('.cityinput').value = newUser.city;

      // click the register button
      compiled.querySelector('.customloginbutton').click();

      // check if the register method of the registerService is called
      expect(registerSpy).toHaveBeenCalledTimes(1);
      expect(sweetAlertSpy).toHaveBeenCalled();
    });
    it('should show error alert when error is thrown', () => {
      // arrange
      component.isEmployee = false;
      const newUser: User = {
        email: 'new@gmail.com',
        password: 'Secret123!',
        firstName: 'Quincy',
        lastName: 'van Deursen',
        city: 'BREDA',
        roles: [],
      };
      component.newUser = newUser;
      jest
        .spyOn(registerService, 'register')
        .mockReturnValueOnce(throwError({ error: { message: 'Een error.' } }));

      const sweetAlertSpy = jest.spyOn(SweetAlert, 'showErrorAlert');
      // act
      component.register();

      // assert
      expect(component.newUser.roles).toEqual([Role.User]);
      expect(registerService.register).toHaveBeenCalledWith(newUser);
      expect(sweetAlertSpy).toHaveBeenCalledWith('Een error.');
    });
  });
});
