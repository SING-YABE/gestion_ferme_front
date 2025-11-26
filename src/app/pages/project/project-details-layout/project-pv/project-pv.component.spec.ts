import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPvComponent } from './project-pv.component';

describe('ProjectBudgetComponent', () => {
  let component: ProjectPvComponent;
  let fixture: ComponentFixture<ProjectPvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectPvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
