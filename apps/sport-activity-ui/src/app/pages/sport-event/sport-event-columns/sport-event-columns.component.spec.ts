import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportEventColumnsComponent } from './sport-event-columns.component';

describe('SportEventColumnsComponent', () => {
  let component: SportEventColumnsComponent;
  let fixture: ComponentFixture<SportEventColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SportEventColumnsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SportEventColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
