import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultAddressPage } from './default-address.page';

describe('DefaultAddressPage', () => {
  let component: DefaultAddressPage;
  let fixture: ComponentFixture<DefaultAddressPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
