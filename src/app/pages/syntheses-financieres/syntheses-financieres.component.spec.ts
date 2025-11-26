import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynthesesFinancieresComponent } from './syntheses-financieres.component';

describe('SynthesesFinancieresComponent', () => {
  let component: SynthesesFinancieresComponent;
  let fixture: ComponentFixture<SynthesesFinancieresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SynthesesFinancieresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SynthesesFinancieresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
