import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGovernmental } from './edit-governmental';

describe('EditGovernmental', () => {
  let component: EditGovernmental;
  let fixture: ComponentFixture<EditGovernmental>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditGovernmental]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditGovernmental);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
