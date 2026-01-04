import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlasnikRezervacijeComponent } from './vlasnik-rezervacije.component';

describe('VlasnikRezervacijeComponent', () => {
  let component: VlasnikRezervacijeComponent;
  let fixture: ComponentFixture<VlasnikRezervacijeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VlasnikRezervacijeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VlasnikRezervacijeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
