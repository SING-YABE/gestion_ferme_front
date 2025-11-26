import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectIntervenantsComponent } from './project-intervenants.component';

describe('ProjectIntervenantsComponent', () => {
  let component: ProjectIntervenantsComponent;
  let fixture: ComponentFixture<ProjectIntervenantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectIntervenantsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectIntervenantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
