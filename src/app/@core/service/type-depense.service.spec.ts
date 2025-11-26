import { TestBed } from '@angular/core/testing';

import { TypeDepenseService } from './type-depense.service';

describe('TypeDepenseService', () => {
  let service: TypeDepenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeDepenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
