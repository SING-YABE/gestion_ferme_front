import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeComponent } from './type-animaux.component';

describe('ProjectTypeComponent', () => {
  let component: ProjectTypeComponent;
  let fixture: ComponentFixture<ProjectTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
