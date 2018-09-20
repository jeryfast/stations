import { TestBed, inject } from '@angular/core/testing';

import { StationStateService } from './station-state.service';

describe('StationStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StationStateService]
    });
  });

  it('should be created', inject([StationStateService], (service: StationStateService) => {
    expect(service).toBeTruthy();
  }));
});
