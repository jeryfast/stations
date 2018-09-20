import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirplanesComponent } from './airplanes.component';

describe('AirplanesComponent', () => {
  let component: AirplanesComponent;
  let fixture: ComponentFixture<AirplanesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirplanesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirplanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
