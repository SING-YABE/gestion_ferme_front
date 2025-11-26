import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaseDetailsComponent } from './phase-details.component';

describe('PhaseDetailsComponent', () => {
  let component: PhaseDetailsComponent;
  let fixture: ComponentFixture<PhaseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhaseDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
