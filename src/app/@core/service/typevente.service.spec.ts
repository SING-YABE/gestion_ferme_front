import { TestBed } from '@angular/core/testing';

import { TypeventeService } from './typevente.service';

describe('TypeventeService', () => {
  let service: TypeventeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeventeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
