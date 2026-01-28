import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadeComponent } from './stade.component';

describe('StadeComponent', () => {
  let component: StadeComponent;
  let fixture: ComponentFixture<StadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
