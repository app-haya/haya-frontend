import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedDeals } from './rejected-deals';

describe('RejectedDeals', () => {
  let component: RejectedDeals;
  let fixture: ComponentFixture<RejectedDeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectedDeals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectedDeals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
