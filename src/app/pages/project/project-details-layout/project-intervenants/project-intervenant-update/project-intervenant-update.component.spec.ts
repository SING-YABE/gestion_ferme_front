import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectIntervenantUpdateComponent } from './project-intervenant-update.component';

describe('ProjectIntervenantUpdateComponent', () => {
  let component: ProjectIntervenantUpdateComponent;
  let fixture: ComponentFixture<ProjectIntervenantUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectIntervenantUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectIntervenantUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
