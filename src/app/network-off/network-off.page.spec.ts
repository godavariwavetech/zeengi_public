import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkOffPage } from './network-off.page';

describe('NetworkOffPage', () => {
  let component: NetworkOffPage;
  let fixture: ComponentFixture<NetworkOffPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkOffPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
