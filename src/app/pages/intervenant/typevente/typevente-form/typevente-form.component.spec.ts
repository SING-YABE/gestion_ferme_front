import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeventeFormComponent } from './typevente-form.component';

describe('TypeventeFormComponent', () => {
  let component: TypeventeFormComponent;
  let fixture: ComponentFixture<TypeventeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeventeFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeventeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
