import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMerchant } from './add-merchant';

describe('AddMerchant', () => {
  let component: AddMerchant;
  let fixture: ComponentFixture<AddMerchant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMerchant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMerchant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
