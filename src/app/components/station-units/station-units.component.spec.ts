import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StationUnitsComponent } from './station-units.component';

describe('StationUnitsComponent', () => {
  let component: StationUnitsComponent;
  let fixture: ComponentFixture<StationUnitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StationUnitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StationUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
