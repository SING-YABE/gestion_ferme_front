import { TestBed } from '@angular/core/testing';

import { SyntheseFinanciereService } from './synthese-financiere.service';

describe('SyntheseFinanciereService', () => {
  let service: SyntheseFinanciereService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyntheseFinanciereService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
