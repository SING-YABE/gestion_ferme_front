import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeAnimalFormComponent } from './type-animaux-form.component';
describe('ProjectTypeFormComponent', () => {
  let component: TypeAnimalFormComponent;
  let fixture: ComponentFixture<TypeAnimalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeAnimalFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeAnimalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
