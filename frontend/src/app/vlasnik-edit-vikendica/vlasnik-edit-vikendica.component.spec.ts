import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlasnikEditVikendicaComponent } from './vlasnik-edit-vikendica.component';

describe('VlasnikEditVikendicaComponent', () => {
  let component: VlasnikEditVikendicaComponent;
  let fixture: ComponentFixture<VlasnikEditVikendicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VlasnikEditVikendicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VlasnikEditVikendicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
