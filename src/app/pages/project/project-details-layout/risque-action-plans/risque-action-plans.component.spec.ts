import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisqueActionPlansComponent } from './risque-action-plans.component';

describe('RisqueActionPlansComponent', () => {
  let component: RisqueActionPlansComponent;
  let fixture: ComponentFixture<RisqueActionPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisqueActionPlansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RisqueActionPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
