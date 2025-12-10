import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlimentPredictionsComponent } from './aliment-predictions.component';

describe('AlimentPredictionsComponent', () => {
  let component: AlimentPredictionsComponent;
  let fixture: ComponentFixture<AlimentPredictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlimentPredictionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlimentPredictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
