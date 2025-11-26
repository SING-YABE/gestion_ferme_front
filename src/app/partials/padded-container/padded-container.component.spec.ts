import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaddedContainerComponent } from './padded-container.component';

describe('PaddedContainerComponent', () => {
  let component: PaddedContainerComponent;
  let fixture: ComponentFixture<PaddedContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaddedContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaddedContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
