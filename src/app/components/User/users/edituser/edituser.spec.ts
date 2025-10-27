import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Edituser } from './edituser';

describe('Edituser', () => {
  let component: Edituser;
  let fixture: ComponentFixture<Edituser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Edituser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Edituser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
