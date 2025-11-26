import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesdiversesComponent } from './chargesdiverses.component';

describe('ChargesdiversesComponent', () => {
  let component: ChargesdiversesComponent;
  let fixture: ComponentFixture<ChargesdiversesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesdiversesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChargesdiversesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
