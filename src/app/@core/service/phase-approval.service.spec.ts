import { TestBed } from '@angular/core/testing';

import { PhaseApprovalService } from './phase-approval.service';

describe('PhaseApprovalService', () => {
  let service: PhaseApprovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhaseApprovalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
