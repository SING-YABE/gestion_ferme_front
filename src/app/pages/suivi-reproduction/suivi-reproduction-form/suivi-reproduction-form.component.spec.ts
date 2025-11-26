import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviReproductionFormComponent } from './suivi-reproduction-form.component';

describe('SuiviReproductionFormComponent', () => {
  let component: SuiviReproductionFormComponent;
  let fixture: ComponentFixture<SuiviReproductionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviReproductionFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuiviReproductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
