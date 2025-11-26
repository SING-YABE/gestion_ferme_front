import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SanteSoinsComponent } from './sante-soins.component';

describe('SanteSoinsComponent', () => {
  let component: SanteSoinsComponent;
  let fixture: ComponentFixture<SanteSoinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SanteSoinsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SanteSoinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
