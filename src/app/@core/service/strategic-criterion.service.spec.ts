import { TestBed } from '@angular/core/testing';

import { StrategicCriterionService } from './strategic-criterion.service';

describe('StrategicCriterionService', () => {
  let service: StrategicCriterionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StrategicCriterionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
