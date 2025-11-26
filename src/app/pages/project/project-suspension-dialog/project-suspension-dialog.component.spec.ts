import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSuspensionDialogComponent } from './project-suspension-dialog.component';

describe('ProjectSuspensionDialogComponent', () => {
  let component: ProjectSuspensionDialogComponent;
  let fixture: ComponentFixture<ProjectSuspensionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSuspensionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectSuspensionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
