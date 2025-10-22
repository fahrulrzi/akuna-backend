import * as Xendit from 'xendit-node';

// Initialize Xendit
const xendit = new (Xendit as any)({
  secretKey: process.env.XENDIT_SECRET_KEY || '',
});

// Export instances
export const xenditInvoice = xendit.Invoice;
export const xenditVirtualAccount = xendit.VirtualAcc;
export const xenditEWallet = xendit.EWallet;
export const xenditRetailOutlet = xendit.RetailOutlet;
export const xenditQRCode = xendit.QRCode;
export const xenditCardless = xendit.Cardless;
export const xenditPayout = xendit.Payout;
export const xenditBalance = xendit.Balance;

export default xendit;