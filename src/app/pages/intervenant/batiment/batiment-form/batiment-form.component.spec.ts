import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatimentFormComponent } from './batiment-form.component';

describe('BatimentFormComponent', () => {
  let component: BatimentFormComponent;
  let fixture: ComponentFixture<BatimentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatimentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BatimentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
