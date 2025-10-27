import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cities } from './cities';

describe('Cities', () => {
  let component: Cities;
  let fixture: ComponentFixture<Cities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
