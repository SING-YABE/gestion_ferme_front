import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeAlimentComponent } from './type-aliment.component';

describe('TypeAlimentComponent', () => {
  let component: TypeAlimentComponent;
  let fixture: ComponentFixture<TypeAlimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeAlimentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeAlimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
