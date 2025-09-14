import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaymentDetails, CreatePaymentDto } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private base = `${environment.apiBase}/PaymentDetails`;

  constructor(private http: HttpClient) {}

  addPayment(payment: CreatePaymentDto) {
    return this.http.post<PaymentDetails>(this.base, payment);
  }

  getPayments() {
    return this.http.get<PaymentDetails[]>(this.base);
  }

  getPayment(id: number) {
    return this.http.get<PaymentDetails>(`${this.base}/${id}`);
  }

  updatePayment(id: number, payment: CreatePaymentDto) {
    return this.http.put<PaymentDetails>(`${this.base}/${id}`, payment);
  }

  deletePayment(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
