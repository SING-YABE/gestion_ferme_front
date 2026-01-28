import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadeFormComponent } from './stade-form.component';

describe('StadeFormComponent', () => {
  let component: StadeFormComponent;
  let fixture: ComponentFixture<StadeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadeFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StadeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
