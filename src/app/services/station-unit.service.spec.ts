import { TestBed, inject } from '@angular/core/testing';

import { StationUnitService } from './station-unit.service';

describe('StationUnitService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StationUnitService]
    });
  });

  it('should be created', inject([StationUnitService], (service: StationUnitService) => {
    expect(service).toBeTruthy();
  }));
});
