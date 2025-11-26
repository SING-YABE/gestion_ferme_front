import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionFormComponent } from './direction-form.component';

describe('DirectionFormComponent', () => {
  let component: DirectionFormComponent;
  let fixture: ComponentFixture<DirectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
