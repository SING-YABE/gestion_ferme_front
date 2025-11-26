import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatSanteFormComponent } from './etat-sante-form.component';

describe('EtatSanteFormComponent', () => {
  let component: EtatSanteFormComponent;
  let fixture: ComponentFixture<EtatSanteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtatSanteFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EtatSanteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
