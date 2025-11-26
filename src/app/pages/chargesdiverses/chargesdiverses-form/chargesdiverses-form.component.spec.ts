import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesdiversesFormComponent } from './chargesdiverses-form.component';

describe('ChargesdiversesFormComponent', () => {
  let component: ChargesdiversesFormComponent;
  let fixture: ComponentFixture<ChargesdiversesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesdiversesFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChargesdiversesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
