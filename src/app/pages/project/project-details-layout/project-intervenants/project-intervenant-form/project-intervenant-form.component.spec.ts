import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectIntervenantFormComponent } from './project-intervenant-form.component';

describe('ProjectIntervenantFormComponent', () => {
  let component: ProjectIntervenantFormComponent;
  let fixture: ComponentFixture<ProjectIntervenantFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectIntervenantFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectIntervenantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
