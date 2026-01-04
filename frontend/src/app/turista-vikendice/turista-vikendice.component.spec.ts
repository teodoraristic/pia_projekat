import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuristaVikendiceComponent } from './turista-vikendice.component';

describe('TuristaVikendiceComponent', () => {
  let component: TuristaVikendiceComponent;
  let fixture: ComponentFixture<TuristaVikendiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuristaVikendiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TuristaVikendiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
