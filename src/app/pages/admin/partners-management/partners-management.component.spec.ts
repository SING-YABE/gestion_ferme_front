import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnersManagementComponent } from './partners-management.component';

describe('PartnersManagementComponent', () => {
  let component: PartnersManagementComponent;
  let fixture: ComponentFixture<PartnersManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnersManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PartnersManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
