import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerStatisticsComponent } from './owner-statistics.component';

describe('OwnerStatisticsComponent', () => {
  let component: OwnerStatisticsComponent;
  let fixture: ComponentFixture<OwnerStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
