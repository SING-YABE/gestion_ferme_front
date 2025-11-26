import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowFormComponent } from './flow-form.component';

describe('FlowFormComponent', () => {
  let component: FlowFormComponent;
  let fixture: ComponentFixture<FlowFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlowFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
