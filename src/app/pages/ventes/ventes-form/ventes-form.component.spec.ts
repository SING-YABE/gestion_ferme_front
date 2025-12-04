import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentesFormComponent } from './ventes-form.component';

describe('VentesFormComponent', () => {
  let component: VentesFormComponent;
  let fixture: ComponentFixture<VentesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentesFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
