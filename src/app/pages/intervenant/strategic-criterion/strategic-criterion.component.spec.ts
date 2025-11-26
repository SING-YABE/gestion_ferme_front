import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategicCriterionComponent } from './strategic-criterion.component';

describe('StrategicCriterionComponent', () => {
  let component: StrategicCriterionComponent;
  let fixture: ComponentFixture<StrategicCriterionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrategicCriterionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StrategicCriterionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
