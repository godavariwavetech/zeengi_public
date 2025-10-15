import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceriesProductPage } from './groceries-product.page';

describe('GroceriesProductPage', () => {
  let component: GroceriesProductPage;
  let fixture: ComponentFixture<GroceriesProductPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroceriesProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
