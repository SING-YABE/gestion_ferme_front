import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRisquesComponent } from './project-risques.component';

describe('ProjectRisquesComponent', () => {
  let component: ProjectRisquesComponent;
  let fixture: ComponentFixture<ProjectRisquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectRisquesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectRisquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
