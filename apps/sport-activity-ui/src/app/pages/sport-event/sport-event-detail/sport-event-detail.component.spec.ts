import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportEventDetailComponent } from './sport-event-detail.component';

describe('SportEventDetailComponent', () => {
  let component: SportEventDetailComponent;
  let fixture: ComponentFixture<SportEventDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SportEventDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SportEventDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
