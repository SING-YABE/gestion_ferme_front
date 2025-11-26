import { TestBed } from '@angular/core/testing';

import { TypeAnimalService } from './type-animal.service';

describe('TypeAnimalService', () => {
  let service: TypeAnimalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeAnimalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
