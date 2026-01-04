import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuristaHomeComponent } from './turista-home.component';

describe('TuristaHomeComponent', () => {
  let component: TuristaHomeComponent;
  let fixture: ComponentFixture<TuristaHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuristaHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TuristaHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
