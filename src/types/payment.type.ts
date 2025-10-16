// Request body types
export interface CreateTransactionRequest {
  products: Array<{
    productId: number;
    quantity: number;
  }>;
}

// Midtrans notification payload
export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status: string;
  currency: string;
}

// Snap transaction response
export interface SnapTransaction {
  token: string;
  redirect_url: string;
}

// Transaction status response from Midtrans
export interface TransactionStatusResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  approval_code?: string;
  signature_key: string;
  bank?: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  payment_amounts?: Array<any>;
  expiry_time?: string;
}

// Product in transaction
export interface TransactionProduct {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}