import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdertrackingPage } from './ordertracking.page';

describe('OrdertrackingPage', () => {
  let component: OrdertrackingPage;
  let fixture: ComponentFixture<OrdertrackingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdertrackingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
