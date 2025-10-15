import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeliveryLocationPage } from './delivery-location.page';

describe('DeliveryLocationPage', () => {
  let component: DeliveryLocationPage;
  let fixture: ComponentFixture<DeliveryLocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
