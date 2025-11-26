import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesanimauxFormComponent } from './fichesanimaux-form.component';

describe('FichesanimauxFormComponent', () => {
  let component: FichesanimauxFormComponent;
  let fixture: ComponentFixture<FichesanimauxFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichesanimauxFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FichesanimauxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
