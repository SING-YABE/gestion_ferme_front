import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesAnimauxComponent } from './fiches-animaux.component';

describe('FichesAnimauxComponent', () => {
  let component: FichesAnimauxComponent;
  let fixture: ComponentFixture<FichesAnimauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichesAnimauxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FichesAnimauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
