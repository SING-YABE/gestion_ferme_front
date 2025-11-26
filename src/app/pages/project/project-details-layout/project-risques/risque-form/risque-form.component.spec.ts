import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisqueFormComponent } from './risque-form.component';

describe('RisqueFormComponent', () => {
  let component: RisqueFormComponent;
  let fixture: ComponentFixture<RisqueFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisqueFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RisqueFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
