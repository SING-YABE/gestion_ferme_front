import { TestBed } from '@angular/core/testing';

import { CategorieRisquesService } from './categorie-risques.service';

describe('CategorieRisquesService', () => {
  let service: CategorieRisquesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategorieRisquesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
