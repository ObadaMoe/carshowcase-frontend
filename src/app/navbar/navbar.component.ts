import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../models/payment.model';
import {PaymentDetails} from '../models/payment.model';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false
})
export class NavbarComponent {
  // Payment modal state
  showPaymentModal = false;
  submitted = false;
  paymentData = {
    cardHolder: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  };

  constructor(
    private router: Router,
    private paymentService: PaymentService
  ) {}

  goListing(): void {
    this.router.navigate(['/listing'], { queryParams: { q: null, add: null } });
  }

  goManage(): void {
    this.router.navigate(['/manage'], { queryParams: { q: null, add: null } });
  }

  // Payment modal methods
  openPaymentModal(): void {
    this.showPaymentModal = true;
    this.submitted = false;
    this.paymentData = {
      cardHolder: '',
      cardNumber: '',
      expDate: '',
      cvv: ''
    };
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  // Validation helper methods
  isValidCardNumber(): boolean {
    return /^[0-9]{16}$/.test(this.paymentData.cardNumber);
  }

  isValidExpDate(): boolean {
    return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(this.paymentData.expDate);
  }

  isValidCvv(): boolean {
    return /^[0-9]{3}$/.test(this.paymentData.cvv);
  }

  addPayment(form: NgForm): void {
    this.submitted = true;
    if (form.invalid) return;

    const paymentData: CreatePaymentDto = {
      cardHolder: this.paymentData.cardHolder.trim(),
      cardNumber: this.paymentData.cardNumber.trim(),
      expDate: this.paymentData.expDate.trim(),
      cvv: this.paymentData.cvv.trim()
    };

    this.paymentService.addPayment(paymentData).subscribe({
      next: () => {
        alert('Payment details added successfully!');
        this.closePaymentModal();
      },
      error: err => {
        alert('Failed to add payment details: ' + (err?.error || err?.message || ''));
      }
    });
  }
}
