import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskImporterComponent } from './task-importer.component';

describe('TaskImporterComponent', () => {
  let component: TaskImporterComponent;
  let fixture: ComponentFixture<TaskImporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskImporterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
