import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutPolicyPage } from './about-policy.page';

describe('AboutPolicyPage', () => {
  let component: AboutPolicyPage;
  let fixture: ComponentFixture<AboutPolicyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPolicyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
