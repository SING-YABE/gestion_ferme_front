import { TestBed } from '@angular/core/testing';

import { SuiviReproductionService } from './suivi-reproduction.service';

describe('SuiviReproductionService', () => {
  let service: SuiviReproductionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuiviReproductionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
