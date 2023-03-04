import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportEventCreateComponent } from './sport-event-create.component';

describe('SportEventCreateComponent', () => {
  let component: SportEventCreateComponent;
  let fixture: ComponentFixture<SportEventCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SportEventCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SportEventCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
