import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComingsoonPage } from './comingsoon.page';

describe('ComingsoonPage', () => {
  let component: ComingsoonPage;
  let fixture: ComponentFixture<ComingsoonPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComingsoonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
