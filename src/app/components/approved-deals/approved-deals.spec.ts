import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedDeals } from './approved-deals';

describe('ApprovedDeals', () => {
  let component: ApprovedDeals;
  let fixture: ComponentFixture<ApprovedDeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedDeals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedDeals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
