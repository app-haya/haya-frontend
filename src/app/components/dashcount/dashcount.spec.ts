import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashcount } from './dashcount';

describe('Dashcount', () => {
  let component: Dashcount;
  let fixture: ComponentFixture<Dashcount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashcount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashcount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
