import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategicCriterionFormComponent } from './strategic-criterion-form.component';

describe('StrategicCriterionFormComponent', () => {
  let component: StrategicCriterionFormComponent;
  let fixture: ComponentFixture<StrategicCriterionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrategicCriterionFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StrategicCriterionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
