import { TestBed } from '@angular/core/testing';

import { EtatSanteService } from './etat-sante.service';

describe('EtatSanteService', () => {
  let service: EtatSanteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtatSanteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
