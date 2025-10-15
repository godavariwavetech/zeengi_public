import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppReviewPage } from './app-review.page';

describe('AppReviewPage', () => {
  let component: AppReviewPage;
  let fixture: ComponentFixture<AppReviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
