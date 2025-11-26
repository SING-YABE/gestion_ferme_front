import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigManagementComponent } from './config-management.component';

describe('ConfigManagementComponent', () => {
  let component: ConfigManagementComponent;
  let fixture: ComponentFixture<ConfigManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
