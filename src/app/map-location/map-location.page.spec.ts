import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapLocationPage } from './map-location.page';

describe('MapLocationPage', () => {
  let component: MapLocationPage;
  let fixture: ComponentFixture<MapLocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
