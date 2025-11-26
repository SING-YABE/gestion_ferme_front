import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeDepenseFormComponent } from './type-depense-form.component';

describe('TypeDepenseFormComponent', () => {
  let component: TypeDepenseFormComponent;
  let fixture: ComponentFixture<TypeDepenseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeDepenseFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeDepenseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
