import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuristaVikendicaDetaljiComponent } from './turista-vikendica-detalji.component';

describe('TuristaVikendicaDetaljiComponent', () => {
  let component: TuristaVikendicaDetaljiComponent;
  let fixture: ComponentFixture<TuristaVikendicaDetaljiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuristaVikendicaDetaljiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TuristaVikendicaDetaljiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
