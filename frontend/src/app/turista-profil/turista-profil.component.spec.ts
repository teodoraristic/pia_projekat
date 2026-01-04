import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuristaProfilComponent } from './turista-profil.component';

describe('TuristaProfilComponent', () => {
  let component: TuristaProfilComponent;
  let fixture: ComponentFixture<TuristaProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TuristaProfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TuristaProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
