import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUserTasksComponent } from './project-user-tasks.component';

describe('ProjectUserTasksComponent', () => {
  let component: ProjectUserTasksComponent;
  let fixture: ComponentFixture<ProjectUserTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectUserTasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectUserTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
