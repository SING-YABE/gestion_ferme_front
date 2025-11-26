import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoFormComponent } from './po-form.component';

describe('BudgetFormComponent', () => {
  let component: PoFormComponent;
  let fixture: ComponentFixture<PoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
