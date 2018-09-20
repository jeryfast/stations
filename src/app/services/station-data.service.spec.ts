import { TestBed, inject } from '@angular/core/testing';

import { StationDataService } from './station-data.service';

describe('StationDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StationDataService]
    });
  });

  it('should be created', inject([StationDataService], (service: StationDataService) => {
    expect(service).toBeTruthy();
  }));
});
