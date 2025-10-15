import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainResturantPage } from './main-resturant.page';

describe('MainResturantPage', () => {
  let component: MainResturantPage;
  let fixture: ComponentFixture<MainResturantPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MainResturantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
