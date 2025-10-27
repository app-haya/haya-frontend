import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoChart } from './geo-chart';

describe('GeoChart', () => {
  let component: GeoChart;
  let fixture: ComponentFixture<GeoChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeoChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
