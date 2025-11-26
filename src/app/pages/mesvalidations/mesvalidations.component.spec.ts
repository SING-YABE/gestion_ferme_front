import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesvalidationsComponent } from './mesvalidations.component';

describe('MesvalidationsComponent', () => {
  let component: MesvalidationsComponent;
  let fixture: ComponentFixture<MesvalidationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesvalidationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesvalidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
