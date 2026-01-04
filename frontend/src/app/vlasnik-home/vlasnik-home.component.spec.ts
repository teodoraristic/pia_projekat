import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlasnikHomeComponent } from './vlasnik-home.component';

describe('VlasnikHomeComponent', () => {
  let component: VlasnikHomeComponent;
  let fixture: ComponentFixture<VlasnikHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VlasnikHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VlasnikHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
