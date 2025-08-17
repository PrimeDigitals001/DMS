import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfidScannerComponent } from './rfid-scanner.component';

describe('RfidScannerComponent', () => {
  let component: RfidScannerComponent;
  let fixture: ComponentFixture<RfidScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfidScannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfidScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
