import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StationStateComponent } from './station-state.component';

describe('StationStateComponent', () => {
  let component: StationStateComponent;
  let fixture: ComponentFixture<StationStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StationStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StationStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
