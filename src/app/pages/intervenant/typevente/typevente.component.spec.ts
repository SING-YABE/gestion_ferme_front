import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeventeComponent } from './typevente.component';

describe('TypeventeComponent', () => {
  let component: TypeventeComponent;
  let fixture: ComponentFixture<TypeventeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeventeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeventeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
