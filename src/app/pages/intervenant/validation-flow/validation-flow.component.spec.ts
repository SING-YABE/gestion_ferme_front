import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationFlowComponent } from './validation-flow.component';

describe('ValidationFlowComponent', () => {
  let component: ValidationFlowComponent;
  let fixture: ComponentFixture<ValidationFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationFlowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidationFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
