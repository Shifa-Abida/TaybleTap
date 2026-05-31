// API Configuration - Centralized API base URL
// In production, use environment variables

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_URL = API_BASE_URL;

// Helper function to get auth headers
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login/`,
  REGISTER: `${API_URL}/api/auth/register/`,
  ME: `${API_URL}/api/auth/me/`,
  PROFILE: `${API_URL}/api/auth/profile/`,

  // Menu
  MENU: `${API_URL}/api/menu/`,
  MENU_LOW_STOCK: `${API_URL}/api/menu/low-stock/`,
  MENU_ITEM: (id: string) => `${API_URL}/api/menu/${id}/`,
  MENU_TOGGLE: (id: string) => `${API_URL}/api/menu/${id}/toggle/`,

  // Orders
  ORDERS: `${API_URL}/api/orders/`,
  ORDER_DETAIL: (id: string) => `${API_URL}/api/orders/${id}/`,
  ORDER_STATUS: (id: string) => `${API_URL}/api/orders/${id}/status/`,

  // Tables
  TABLES: `${API_URL}/api/tables/`,
  TABLE_DETAIL: (id: string) => `${API_URL}/api/tables/${id}/`,
  TABLE_TOGGLE: (id: string) => `${API_URL}/api/tables/${id}/toggle/`,
  TABLE_QR: (id: string) => `${API_URL}/api/tables/${id}/qr/`,
  TABLES_GENERATE_ALL: `${API_URL}/api/tables/generate-all/`,

  // Customer (public — no auth required)
  CUSTOMER_MENU: (restoId: string) => `${API_URL}/api/customer/menu/?resto=${restoId}`,
  CUSTOMER_RESTAURANT: (restoId: string) => `${API_URL}/api/customer/restaurant/?resto=${restoId}`,
  CUSTOMER_ORDER: `${API_URL}/api/customer/order/`,
  CUSTOMER_ORDER_STATUS: (orderId: string, restoId: string) =>
    `${API_URL}/api/customer/order/${orderId}/?resto=${restoId}`,
};

export default API_URL;
