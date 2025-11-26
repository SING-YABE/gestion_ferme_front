import { TestBed } from '@angular/core/testing';

import { TypeAlimentService } from './type-aliment.service';

describe('TypeAlimentService', () => {
  let service: TypeAlimentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeAlimentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
