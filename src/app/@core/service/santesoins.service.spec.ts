import { TestBed } from '@angular/core/testing';

import { SantesoinsService } from './santesoins.service';

describe('SantesoinsService', () => {
  let service: SantesoinsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SantesoinsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
