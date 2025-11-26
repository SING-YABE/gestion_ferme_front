import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhasesOverviewComponent } from './phases-overview.component';

describe('PhasesOverviewComponent', () => {
  let component: PhasesOverviewComponent;
  let fixture: ComponentFixture<PhasesOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhasesOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PhasesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
