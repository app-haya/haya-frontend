import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannedWords } from './banned-words';

describe('BannedWords', () => {
  let component: BannedWords;
  let fixture: ComponentFixture<BannedWords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannedWords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannedWords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
