import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPoComponent } from './project-po.component';

describe('ProjectBudgetComponent', () => {
  let component: ProjectPoComponent;
  let fixture: ComponentFixture<ProjectPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectPoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
