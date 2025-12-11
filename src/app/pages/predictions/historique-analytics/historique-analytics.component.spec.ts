import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueAnalyticsComponent } from './historique-analytics.component';

describe('HistoriqueAnalyticsComponent', () => {
  let component: HistoriqueAnalyticsComponent;
  let fixture: ComponentFixture<HistoriqueAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueAnalyticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoriqueAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
