import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviReproductionComponent } from './suivi-reproduction.component';

describe('SuiviReproductionComponent', () => {
  let component: SuiviReproductionComponent;
  let fixture: ComponentFixture<SuiviReproductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviReproductionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuiviReproductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
