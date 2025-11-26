import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiClientsComponent } from './api-clients.component';

describe('ApiClientsComponent', () => {
  let component: ApiClientsComponent;
  let fixture: ComponentFixture<ApiClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiClientsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApiClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
