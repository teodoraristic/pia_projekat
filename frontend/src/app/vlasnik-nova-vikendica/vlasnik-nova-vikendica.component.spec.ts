import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlasnikNovaVikendicaComponent } from './vlasnik-nova-vikendica.component';

describe('VlasnikNovaVikendicaComponent', () => {
  let component: VlasnikNovaVikendicaComponent;
  let fixture: ComponentFixture<VlasnikNovaVikendicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VlasnikNovaVikendicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VlasnikNovaVikendicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
