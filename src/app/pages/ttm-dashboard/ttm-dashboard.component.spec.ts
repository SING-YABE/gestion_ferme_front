import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtmDashboardComponent } from './ttm-dashboard.component';

describe('TtmDashboardComponent', () => {
  let component: TtmDashboardComponent;
  let fixture: ComponentFixture<TtmDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TtmDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TtmDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
