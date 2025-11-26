import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCategorieRisquesComponent } from './gestion-categorie-risques.component';

describe('GestionCategorieRisquesComponent', () => {
  let component: GestionCategorieRisquesComponent;
  let fixture: ComponentFixture<GestionCategorieRisquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCategorieRisquesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionCategorieRisquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
