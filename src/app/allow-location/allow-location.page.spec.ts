import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllowLocationPage } from './allow-location.page';

describe('AllowLocationPage', () => {
  let component: AllowLocationPage;
  let fixture: ComponentFixture<AllowLocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllowLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
