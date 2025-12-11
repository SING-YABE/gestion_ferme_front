import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalPredictionsComponent } from './animal-predictions.component';

describe('AnimalPredictionsComponent', () => {
  let component: AnimalPredictionsComponent;
  let fixture: ComponentFixture<AnimalPredictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalPredictionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimalPredictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
