import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlasnikVikendiceComponent } from './vlasnik-vikendice.component';

describe('VlasnikVikendiceComponent', () => {
  let component: VlasnikVikendiceComponent;
  let fixture: ComponentFixture<VlasnikVikendiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VlasnikVikendiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VlasnikVikendiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
