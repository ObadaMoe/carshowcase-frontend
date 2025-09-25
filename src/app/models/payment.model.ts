export interface PaymentDetails {
  paymentId: number;
  cardHolder: string;
  cardNumber: string;
  expDate: string;
  cvv: string;
}

export interface CreatePaymentDto {
  cardHolder: string;
  cardNumber: string;
  expDate: string;
  cvv: string;
}
