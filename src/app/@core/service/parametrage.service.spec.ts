import { TestBed } from '@angular/core/testing';

import { ParametrageService } from './parametrage.service';

describe('ParametrageService', () => {
  let service: ParametrageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParametrageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
