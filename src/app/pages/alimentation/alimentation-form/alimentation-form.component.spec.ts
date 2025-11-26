import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlimentationFormComponent } from './alimentation-form.component';

describe('AlimentationFormComponent', () => {
  let component: AlimentationFormComponent;
  let fixture: ComponentFixture<AlimentationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlimentationFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlimentationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
