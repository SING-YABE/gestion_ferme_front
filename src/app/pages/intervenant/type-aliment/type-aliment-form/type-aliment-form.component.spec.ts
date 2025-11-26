import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeAlimentFormComponent } from './type-aliment-form.component';

describe('TypeAlimentFormComponent', () => {
  let component: TypeAlimentFormComponent;
  let fixture: ComponentFixture<TypeAlimentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeAlimentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeAlimentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
