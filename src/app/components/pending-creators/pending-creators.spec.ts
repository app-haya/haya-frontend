import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingCreators } from './pending-creators';

describe('PendingCreators', () => {
  let component: PendingCreators;
  let fixture: ComponentFixture<PendingCreators>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingCreators]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingCreators);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
