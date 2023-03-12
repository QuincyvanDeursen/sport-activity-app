import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportEventUpdateComponent } from './sport-event-update.component';

describe('SportEventUpdateComponent', () => {
  let component: SportEventUpdateComponent;
  let fixture: ComponentFixture<SportEventUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SportEventUpdateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SportEventUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
