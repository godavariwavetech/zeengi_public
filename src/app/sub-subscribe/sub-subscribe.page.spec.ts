import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubSubscribePage } from './sub-subscribe.page';

describe('SubSubscribePage', () => {
  let component: SubSubscribePage;
  let fixture: ComponentFixture<SubSubscribePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubSubscribePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
