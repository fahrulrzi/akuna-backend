export interface ShippingItems {
  name: string;
  quantity: number;
  value: number;
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface ShippingDetails {
  origin_postal_code: number;
  destination_postal_code: number;
  couriers: string;
  items: ShippingItems[];
}

export interface BiteshipLocation {
  location_id: string | null;
  latitude: number | null;
  longitude: number | null;
  postal_code: number | string | null;
  country_name: string;
  country_code: string;
  administrative_division_level_1_name?: string;
  administrative_division_level_2_name?: string;
  administrative_division_level_3_name?: string;
  administrative_division_level_4_name?: string;
  address?: string | null;
}

export interface BiteshipPricingItem {
  available_collection_method: string[]; // e.g. ["pickup"]
  available_for_cash_on_delivery: boolean;
  available_for_proof_of_delivery: boolean;
  available_for_instant_waybill_id: boolean;
  available_for_insurance: boolean;
  company: string; // internal company id (e.g. "jne")
  courier_name: string; // "JNE"
  courier_code: string; // "jne"
  courier_service_name: string; // e.g. "Reguler"
  courier_service_code: string; // e.g. "reg"
  currency: string; // "IDR"
  description?: string;
  duration?: string; // "3 - 4 days"
  shipment_duration_range?: string;
  shipment_duration_unit?: string; // "days"
  service_type?: string; // "standard"
  shipping_type?: string; // "parcel" | "freight"
  price: number; // total price returned
  shipping_fee: number; // base shipping fee
  shipping_fee_discount: number;
  shipping_fee_surcharge: number;
  insurance_fee: number;
  cash_on_delivery_fee: number;
  tax_lines: any[];
  type?: string; // e.g. "reg" or "jtr"
}

export interface BiteshipRatesResponse {
  success: boolean;
  object: string;
  message?: string;
  code?: number;
  origin: BiteshipLocation;
  stops?: any[];
  destination: BiteshipLocation;
  pricing: BiteshipPricingItem[];
}
