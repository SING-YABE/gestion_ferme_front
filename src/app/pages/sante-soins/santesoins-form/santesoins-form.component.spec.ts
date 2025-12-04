import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SantesoinsFormComponent } from './santesoins-form.component';

describe('SantesoinsFormComponent', () => {
  let component: SantesoinsFormComponent;
  let fixture: ComponentFixture<SantesoinsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SantesoinsFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SantesoinsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
