import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VegmodeModalPage } from './vegmode-modal.page';

describe('VegmodeModalPage', () => {
  let component: VegmodeModalPage;
  let fixture: ComponentFixture<VegmodeModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VegmodeModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
