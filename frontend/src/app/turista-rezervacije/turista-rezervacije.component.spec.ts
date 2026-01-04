import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuristaRezervacijeComponent } from './turista-rezervacije.component';

describe('TuristaRezervacijeComponent', () => {
  let component: TuristaRezervacijeComponent;
  let fixture: ComponentFixture<TuristaRezervacijeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuristaRezervacijeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TuristaRezervacijeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
