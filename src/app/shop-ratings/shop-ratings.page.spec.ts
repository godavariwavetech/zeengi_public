import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopRatingsPage } from './shop-ratings.page';

describe('ShopRatingsPage', () => {
  let component: ShopRatingsPage;
  let fixture: ComponentFixture<ShopRatingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopRatingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
