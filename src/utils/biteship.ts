import { config } from "../config/index.js";

const BASE_URL = `${config.biteship.baseUrl}/v1`;

type HttpMethod = "GET" | "POST";

async function request(path: string, method: HttpMethod, body?: unknown) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.biteship.apiKey}`,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Biteship Error:", JSON.stringify(data, null, 2));
    throw { status: res.status, data };
  }

  return data;
}

export const biteshipClient = {
  searchAreas(query: string) {
    return request(`/maps/areas?countries=ID&input=${encodeURIComponent(query)}&type=single`, "GET");
  },

  getRates(payload: unknown) {
    return request("/rates/couriers", "POST", payload);
  },

  createOrder(payload: unknown) {
    return request("/orders", "POST", payload);
  },

  getTracking(orderId: string) {
    return request(`/trackings/${orderId}`, "GET");
  },
};