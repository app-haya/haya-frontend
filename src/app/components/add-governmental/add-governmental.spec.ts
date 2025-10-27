import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGovernmental } from './add-governmental';

describe('AddGovernmental', () => {
  let component: AddGovernmental;
  let fixture: ComponentFixture<AddGovernmental>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGovernmental]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGovernmental);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
