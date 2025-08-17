import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-rfid-scanner',
  imports: [CommonModule],
  templateUrl: './rfid-scanner.component.html',
  styleUrl: './rfid-scanner.component.css'
})
export class RfidScannerComponent implements OnInit, OnDestroy {
  isWaiting = true;
  showPopup = false;
  scannedData = '';

  private inputBuffer = '';
  private inputTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.focusScanner();
  }

  ngOnDestroy(): void {
    this.clearInputTimeout();
  }

  // Listen to global key events
  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Allow F5 and F12, prevent other defaults
    if (!['F5', 'F12'].includes(event.key)) event.preventDefault();

    if (event.key === 'Enter') {
      this.processBuffer();
    } else if (event.key.length === 1) {
      this.appendToBuffer(event.key);
    }
  }

  private appendToBuffer(char: string): void {
    this.inputBuffer += char;
    this.resetInputTimeout();
  }

  private processBuffer(): void {
    const data = this.inputBuffer.trim();
    if (!data) return;

    this.scannedData = data;
    this.isWaiting = false;
    this.showPopup = true;

    this.clearInputBuffer();
  }

  private resetInputTimeout(): void {
    this.clearInputTimeout();
    this.inputTimeoutId = setTimeout(() => this.processBuffer(), 100);
  }

  private clearInputTimeout(): void {
    if (this.inputTimeoutId) {
      clearTimeout(this.inputTimeoutId);
      this.inputTimeoutId = null;
    }
  }

  private clearInputBuffer(): void {
    this.inputBuffer = '';
  }

  closePopup(): void {
    this.showPopup = false;
    this.resetScanner();
  }

  private resetScanner(): void {
    this.isWaiting = true;
    this.scannedData = '';
    this.clearInputBuffer();
    this.focusScanner();
  }

  private focusScanner(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.document.getElementById('rfid-scanner-container');
    element?.focus();
  }
}
