import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlasnikProfilComponent } from './vlasnik-profil.component';

describe('VlasnikProfilComponent', () => {
  let component: VlasnikProfilComponent;
  let fixture: ComponentFixture<VlasnikProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VlasnikProfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VlasnikProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
