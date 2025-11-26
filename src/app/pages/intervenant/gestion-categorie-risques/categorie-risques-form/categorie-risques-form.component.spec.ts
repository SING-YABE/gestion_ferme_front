import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorieRisquesFormComponent } from './categorie-risques-form.component';

describe('CategorieRisquesFormComponent', () => {
  let component: CategorieRisquesFormComponent;
  let fixture: ComponentFixture<CategorieRisquesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorieRisquesFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategorieRisquesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
