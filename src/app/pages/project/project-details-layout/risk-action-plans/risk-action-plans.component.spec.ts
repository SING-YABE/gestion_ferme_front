import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskActionPlansComponent } from './risk-action-plans.component';

describe('RiskActionPlansComponent', () => {
  let component: RiskActionPlansComponent;
  let fixture: ComponentFixture<RiskActionPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskActionPlansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiskActionPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
