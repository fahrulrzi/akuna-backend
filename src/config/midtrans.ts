import midtransClient from 'midtrans-client';

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

const coreApiInstance = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// Wrapper functions untuk CoreApi dengan proper typing
export const midtransCore = {
  /**
   * Get transaction status from Midtrans
   */
  async getTransactionStatus(orderId: string): Promise<any> {
    return await (coreApiInstance as any).transaction.status(orderId);
  },

  /**
   * Cancel transaction
   */
  async cancelTransaction(orderId: string): Promise<any> {
    return await (coreApiInstance as any).transaction.cancel(orderId);
  },

  /**
   * Approve transaction
   */
  async approveTransaction(orderId: string): Promise<any> {
    return await (coreApiInstance as any).transaction.approve(orderId);
  },

  /**
   * Refund transaction
   */
  async refundTransaction(orderId: string, parameter?: any): Promise<any> {
    return await (coreApiInstance as any).transaction.refund(orderId, parameter);
  },

  /**
   * Get transaction status by transaction_id (not order_id)
   */
  async getTransactionStatusB2B(transactionId: string): Promise<any> {
    return await (coreApiInstance as any).transaction.statusb2b(transactionId);
  },
};

// Export original coreApi jika masih diperlukan
export const coreApi = coreApiInstance;