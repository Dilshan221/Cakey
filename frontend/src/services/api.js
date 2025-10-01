// src/services/api.js
const ENV =
  (typeof import.meta !== "undefined" && import.meta.env) || process.env;

export const API_BASE_URL =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  ENV?.VITE_API_BASE ||
  ENV?.VITE_API_URL ||
  ENV?.REACT_APP_API_URL ||
  "http://localhost:8000/api";

const qs = (obj = {}) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else params.append(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
};

const isFormData = (v) =>
  typeof FormData !== "undefined" && v instanceof FormData;

const resolveUrl = (base, endpoint) => {
  if (!endpoint) return base;
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  if (base.endsWith("/") && endpoint.startsWith("/"))
    return base + endpoint.slice(1);
  if (!base.endsWith("/") && !endpoint.startsWith("/"))
    return `${base}/${endpoint}`;
  return base + endpoint;
};

const authStore = {
  getToken() {
    return localStorage.getItem("cb_token");
  },
  setAuth({ token, user }) {
    if (token) localStorage.setItem("cb_token", token);
    if (user) localStorage.setItem("cb_user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_user");
  },
  currentUser() {
    try {
      return JSON.parse(localStorage.getItem("cb_user") || "null");
    } catch {
      return null;
    }
  },
};

let AUTH_TOKEN = null;

export const apiService = {
  setAuthToken(token) {
    AUTH_TOKEN = token || null;
  },

  async request(endpoint, options = {}) {
    const url = resolveUrl(API_BASE_URL, endpoint);
    const token = AUTH_TOKEN ?? authStore.getToken();

    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutMs = options.timeoutMs ?? 12000;
    let timer = null;
    if (controller) timer = setTimeout(() => controller.abort(), timeoutMs);

    const initialHeaders = options.headers || {};
    const usingFormData = isFormData(options.body);

    const headers = {
      ...(usingFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...initialHeaders,
    };

    const cfg = {
      method: options.method || "GET",
      headers,
      credentials: "omit",
      signal: controller?.signal,
      ...options,
    };

    if (cfg.body && !usingFormData && typeof cfg.body === "object") {
      cfg.body = JSON.stringify(cfg.body);
    }

    try {
      const res = await fetch(url, cfg);

      if (!res.ok) {
        let errorData = null;
        try {
          errorData = await res.json();
        } catch {}
        const err = new Error(
          (errorData && (errorData.error || errorData.message)) ||
            `HTTP error: ${res.status} ${res.statusText}`
        );
        err.response = res;
        err.data = errorData;
        throw err;
      }

      if (res.status === 204) return null;

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) return await res.json();
      if (contentType.includes("text/")) return await res.text();
      return await res.blob();
    } catch (error) {
      if (controller && error?.name === "AbortError") {
        const e = new Error("Request timed out");
        e.cause = error;
        throw e;
      }
      if (
        error?.name === "TypeError" &&
        /Failed to fetch/i.test(error.message)
      ) {
        const netErr = new Error(
          "Network error: Could not connect to the server"
        );
        netErr.cause = error;
        throw netErr;
      }
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  },

  /* Health */
  testConnection() {
    return this.request("/health");
  },

  /* Auth */
  async login(credentials) {
    const data = await this.request("/usermanagement/login", {
      method: "POST",
      body: credentials,
    });
    if (data?.token) authStore.setAuth(data);
    return data;
  },
  logout() {
    authStore.clear();
    this.setAuthToken(null);
  },
  me() {
    return authStore.currentUser();
  },

  /* Products */
  listProducts(query = {}) {
    return this.request(`/products${qs(query)}`);
  },
  getProduct(id) {
    return this.request(`/products/${id}`);
  },
  createProduct(payload) {
    return this.request("/products", { method: "POST", body: payload });
  },
  updateProduct(id, payload) {
    return this.request(`/products/${id}`, { method: "PUT", body: payload });
  },
  deleteProduct(id) {
    return this.request(`/products/${id}`, { method: "DELETE" });
  },

  /* Employees */
  listEmployees(query = {}) {
    return this.request(`/employees${qs(query)}`);
  },
  getEmployee(id) {
    return this.request(`/employees/${id}`);
  },
  createEmployee(payload) {
    return this.request("/employees", { method: "POST", body: payload });
  },
  updateEmployee(id, payload) {
    return this.request(`/employees/${id}`, { method: "PUT", body: payload });
  },
  deleteEmployee(id) {
    return this.request(`/employees/${id}`, { method: "DELETE" });
  },

  /* Attendance */
  listAttendance(query = {}) {
    return this.request(`/attendance${qs(query)}`);
  },

  /* Payments */
  listPayments(query = {}) {
    return this.request(`/payments${qs(query)}`);
  },
  getPayment(id) {
    return this.request(`/payments/${id}`);
  },
  createPayment(payload) {
    return this.request(`/payments`, { method: "POST", body: payload });
  },
  deletePayment(id) {
    return this.request(`/payments/${id}`, { method: "DELETE" });
  },

  /* Users */
  getUsers(query = {}) {
    return this.request(`/user${qs(query)}`);
  },
  getUser(id) {
    return this.request(`/user/${id}`);
  },
  createUser(payload) {
    return this.request("/user", { method: "POST", body: payload });
  },
  updateUser(id, payload) {
    return this.request(`/user/${id}`, { method: "PUT", body: payload });
  },
  deleteUser(id) {
    return this.request(`/user/${id}`, { method: "DELETE" });
  },

  /* Salaries */
  listSalaryRecords(query = {}) {
    return this.request(`/salaries${qs(query)}`);
  },
  createSalaryRecord(payload) {
    return this.request(`/salaries`, { method: "POST", body: payload });
  },

  /* Orders (delivery) */
  listOrders(query = {}) {
    return this.request(`/delivery/orders${qs(query)}`);
  },
  createOrder(body) {
    // keep your core endpoint for now
    return this.request("/order/create", { method: "POST", body });
  },
  updateOrderStatus(orderId, status) {
    return this.request(`/delivery/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
  deleteOrder(orderId) {
    return this.request(`/delivery/orders/${orderId}`, { method: "DELETE" });
  },

  /* Custom Orders */
  createCustomOrder(payload) {
    const hasFile =
      typeof File !== "undefined" && payload?.designImage instanceof File;
    if (hasFile) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (k === "designImage") fd.append("designImage", v);
        else fd.append(k, v);
      });
      return this.request("/custom-orders", { method: "POST", body: fd });
    }
    return this.request("/custom-orders", { method: "POST", body: payload });
  },
  listCustomOrders(query = {}) {
    return this.request(`/custom-orders${qs(query)}`);
  },
  getCustomOrdersStats() {
    return this.request("/custom-orders/dashboard/stats");
  },
  updateCustomOrderStatus(orderId, status) {
    return this.request(`/custom-orders/status/${orderId}`, {
      method: "PATCH",
      body: { status },
    });
  },
  cancelCustomOrder(orderId) {
    return this.request(`/custom-orders/cancel/${orderId}`, {
      method: "DELETE",
    });
  },
};

export const ReviewsAPI = {
  list: (query = {}) => apiService.request(`/reviews${qs(query)}`),
  get: (id) => apiService.request(`/reviews/${id}`),
  create: (payload) =>
    apiService.request(`/reviews`, { method: "POST", body: payload }),
  update: (id, payload) =>
    apiService.request(`/reviews/${id}`, { method: "PATCH", body: payload }),
  updateStatus: (id, status) =>
    apiService.request(`/reviews/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),
  remove: (id) => apiService.request(`/reviews/${id}`, { method: "DELETE" }),
};

export const ComplaintsAPI = {
  list: (query = {}) => apiService.request(`/complaints${qs(query)}`),
  get: (id) => apiService.request(`/complaints/${id}`),
  create: (payload) =>
    apiService.request(`/complaints`, { method: "POST", body: payload }),
  update: (id, payload) =>
    apiService.request(`/complaints/${id}`, { method: "PUT", body: payload }),
  updateStatus: (id, status) =>
    apiService.request(`/complaints/${id}`, {
      method: "PATCH",
      body: { status },
    }),
  addReply: (id, message, by) =>
    apiService.request(`/complaints/${id}/replies`, {
      method: "POST",
      body: { message, by },
    }),
  remove: (id) => apiService.request(`/complaints/${id}`, { method: "DELETE" }),
};

export const userMgmtAPI = {
  login: (email, password) => apiService.login({ email, password }),
  list: (q) => apiService.getUsers(q),
  get: (id) => apiService.getUser(id),
  create: (payload) => apiService.createUser(payload),
  update: (id, payload) => apiService.updateUser(id, payload),
  remove: (id) => apiService.deleteUser(id),
};

export default apiService;
