import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePermissionFormComponent } from './role-permission-form.component';

describe('RolePermissionFormComponent', () => {
  let component: RolePermissionFormComponent;
  let fixture: ComponentFixture<RolePermissionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePermissionFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RolePermissionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
