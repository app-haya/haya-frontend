import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeal } from './add-deal';

describe('AddDeal', () => {
  let component: AddDeal;
  let fixture: ComponentFixture<AddDeal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDeal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDeal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
