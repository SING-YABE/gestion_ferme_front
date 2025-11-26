import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableItemComponent } from './deliverable-item.component';

describe('DeliverableItemComponent', () => {
  let component: DeliverableItemComponent;
  let fixture: ComponentFixture<DeliverableItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverableItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliverableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
