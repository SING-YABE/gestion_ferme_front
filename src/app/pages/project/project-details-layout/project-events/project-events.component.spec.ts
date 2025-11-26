import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectEventsComponent } from './project-events.component';

describe('ProjectEventsComponent', () => {
  let component: ProjectEventsComponent;
  let fixture: ComponentFixture<ProjectEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
