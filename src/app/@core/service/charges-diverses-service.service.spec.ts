import { TestBed } from '@angular/core/testing';

import { ChargesDiversesServiceService } from './charges-diverses-service.service';

describe('ChargesDiversesServiceService', () => {
  let service: ChargesDiversesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargesDiversesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
