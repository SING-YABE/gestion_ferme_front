import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraitementFormComponent } from './traitement-form.component';

describe('TraitementFormComponent', () => {
  let component: TraitementFormComponent;
  let fixture: ComponentFixture<TraitementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraitementFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TraitementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
