import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatSanteComponent } from './etat-sante.component';

describe('EtatSanteComponent', () => {
  let component: EtatSanteComponent;
  let fixture: ComponentFixture<EtatSanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtatSanteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EtatSanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
