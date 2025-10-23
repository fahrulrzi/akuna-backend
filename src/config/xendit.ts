import { Xendit } from "xendit-node";

// Initialize Xendit
const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || "",
});

// Export instances
export const xenditInvoice = xendit.Invoice;
// export const xenditVirtualAccount = xendit.VirtualAcc;
// export const xenditEWallet = xendit.EWallet;
// export const xenditRetailOutlet = xendit.RetailOutlet;
// export const xenditQRCode = xendit.QRCode;
// export const xenditCardless = xendit.Cardless;
export const xenditPayout = xendit.Payout;
export const xenditBalance = xendit.Balance;

export const xenditPaymentMethod = xendit.PaymentMethod;
export const xenditPaymentRequest = xendit.PaymentRequest;

export default xendit;
