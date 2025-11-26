import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatimentComponent } from './batiment.component';

describe('BatimentComponent', () => {
  let component: BatimentComponent;
  let fixture: ComponentFixture<BatimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatimentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BatimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
