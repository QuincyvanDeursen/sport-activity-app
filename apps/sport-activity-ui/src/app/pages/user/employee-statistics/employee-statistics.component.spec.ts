import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeStatisticsComponent } from './employee-statistics.component';

describe('EmployeeStatisticsComponent', () => {
  let component: EmployeeStatisticsComponent;
  let fixture: ComponentFixture<EmployeeStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeStatisticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
