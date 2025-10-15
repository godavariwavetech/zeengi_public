import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicelocationPage } from './servicelocation.page';

describe('ServicelocationPage', () => {
  let component: ServicelocationPage;
  let fixture: ComponentFixture<ServicelocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicelocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
