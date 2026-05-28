import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeplacementFormComponent } from './deplacement-form.component';

describe('DeplacementFormComponent', () => {
  let component: DeplacementFormComponent;
  let fixture: ComponentFixture<DeplacementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeplacementFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeplacementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
