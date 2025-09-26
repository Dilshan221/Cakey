// src/services/api.js
//
// Resolves API base (supports Vite & CRA). Defaults to http://localhost:8000/api
const ENV =
  (typeof import.meta !== "undefined" && import.meta.env) || process.env;

export const API_BASE_URL =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  ENV?.VITE_API_BASE ||
  ENV?.VITE_API_URL ||
  ENV?.REACT_APP_API_URL ||
  "http://localhost:8000/api";

/* ------------------------------ Small utils ------------------------------ */
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

// Join base + endpoint safely; allow absolute endpoints to pass through
const resolveUrl = (base, endpoint) => {
  if (!endpoint) return base;
  if (/^https?:\/\//i.test(endpoint)) return endpoint; // absolute
  if (base.endsWith("/") && endpoint.startsWith("/"))
    return base + endpoint.slice(1);
  if (!base.endsWith("/") && !endpoint.startsWith("/"))
    return `${base}/${endpoint}`;
  return base + endpoint;
};

/* ------------------------------ Auth store ------------------------------ */
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

/* ------------------------------ Core client ------------------------------ */
export const apiService = {
  /**
   * Fetch wrapper with JSON headers/Authorization, timeout, JSON parsing, etc.
   */
  async request(endpoint, options = {}) {
    const url = resolveUrl(API_BASE_URL, endpoint);
    const token = authStore.getToken();

    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutMs = options.timeoutMs ?? 12000;
    let timer = null;
    if (controller) timer = setTimeout(() => controller.abort(), timeoutMs);

    // Build headers. Respect caller's headers and avoid forcing JSON for FormData.
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

    // Ensure body is stringified if it's a plain object
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

  /* ------------------------------ Health ------------------------------ */
  testConnection() {
    return this.request("/health");
  },

  /* -------------------------------- Auth -------------------------------- */
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
  },
  me() {
    return authStore.currentUser();
  },

  /* ----------------------- User Management (legacy) ----------------------- */
  registerUser(userData) {
    return this.request("/usermanagement/register", {
      method: "POST",
      body: userData,
    });
  },
  // ⚠️ legacy single-user route (kept for backward compatibility)
  getUserById(id) {
    return this.request(`/usermanagement/${id}`);
  },
  updateUserLegacy(id, userData) {
    return this.request(`/usermanagement/${id}`, {
      method: "PUT",
      body: userData,
    });
  },
  deleteUserLegacy(id) {
    return this.request(`/usermanagement/${id}`, { method: "DELETE" });
  },

  /* ------------------------------ Products ----------------------------- */
  listProducts(query = {}) {
    return this.request(`/products${qs(query)}`);
  },
  getProduct(id) {
    return this.request(`/products/${id}`);
  },
  // Alias used by pages: apiService.getProductById(id)
  getProductById(id) {
    return this.getProduct(id);
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
  // NEW: categories for filters/forms
  listProductCategories() {
    return this.request("/products/categories");
  },

  /* ------------------------------ Employees ---------------------------- */
  listEmployees(query = {}) {
    return this.request(`/employees${qs(query)}`);
  },
  getEmployees(query = {}) {
    return this.listEmployees(query);
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
  updateEmployeePayout(id, payout) {
    return this.request(`/employees/${id}/payout`, {
      method: "PUT",
      body: payout,
    });
  },
  uploadEmployeeAvatar(id, file) {
    const fd = new FormData();
    fd.append("avatar", file);
    return this.request(`/employees/${id}/avatar`, {
      method: "POST",
      body: fd,
    });
  },
  sendEmployeeOtp(id, phone) {
    return this.request(`/employees/${id}/otp/send`, {
      method: "POST",
      body: { phone },
    });
  },
  verifyEmployeeOtp(id, code) {
    return this.request(`/employees/${id}/otp/verify`, {
      method: "POST",
      body: { code },
    });
  },
  getEmployeeStats() {
    return this.request("/employees/stats");
  },

  /* ------------------------------ Attendance --------------------------- */
  listAttendance(query = {}) {
    return this.request(`/attendance${qs(query)}`);
  },
  getAttendance(id) {
    return this.request(`/attendance/${id}`);
  },
  markAttendance(payload) {
    return this.request("/attendance", { method: "POST", body: payload });
  },
  updateAttendance(id, payload) {
    return this.request(`/attendance/${id}`, { method: "PUT", body: payload });
  },
  deleteAttendance(id) {
    return this.request(`/attendance/${id}`, { method: "DELETE" });
  },

  /* ------------------------------ Payments ------------------------------ */
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

  /* ------------------------------ Users (modern) ------------------------- */
  getUsers(query = {}) {
    return this.request(`/user${qs(query)}`);
  },
  // ✅ modern single-user route used by dashboards
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

  /* ------------------------------ Salaries ------------------------------ */
  listSalaryRecords(query = {}) {
    return this.request(`/salaries${qs(query)}`);
  },
  getSalaryRecords(employeeId, query = {}) {
    return this.listSalaryRecords({ employeeId, ...query });
  },
  createSalaryRecord(payload) {
    // { employeeId, period:"YYYY-MM", baseSalary, paidAmount, method, currency, note, paymentId?, paymentReference?, status? }
    return this.request(`/salaries`, { method: "POST", body: payload });
  },
  updateSalaryRecord(id, payload) {
    return this.request(`/salaries/${id}`, { method: "PUT", body: payload });
  },
  deleteSalaryRecord(id) {
    return this.request(`/salaries/${id}`, { method: "DELETE" });
  },

  // ------------------------------- Orders ------------------------------- //
  // High-level helper that maps UI payload (from OrderPage) to backend contract.
  createOrderFromOrderPage: (ui) => {
    // Map UI -> backend enums (creditCard | afterpay | cashOnDelivery)
    let paymentMethod = "creditCard";
    if (ui.paymentMethod === "afterpay") paymentMethod = "afterpay";
    else if (
      ui.paymentMethod === "cashOnDelivery" ||
      ui.paymentMethod === "cod"
    )
      paymentMethod = "cashOnDelivery";

    // Try to carry product snapshot price explicitly
    const basePrice =
      ui.basePrice ??
      ui.productPrice ??
      ui.unitPrice ??
      ui.product?.price ??
      ui.price ??
      0;

    const body = {
      customerName: ui.customer?.name,
      customerPhone: ui.customer?.phone,
      deliveryAddress: ui.customer?.address,
      deliveryDate: ui.delivery?.date, // "YYYY-MM-DD"
      deliveryTime: ui.delivery?.timeSlot, // morning | afternoon | evening
      specialInstructions: ui.note || "",

      size: ui.size,
      quantity: ui.qty,
      frosting: ui.frosting || "butterCream",

      paymentMethod, // creditCard | afterpay | cashOnDelivery
      subtotal: ui.subtotal,
      tax: ui.tax,
      total: ui.total,
      deliveryFee: ui.deliveryFee, // backend defaults to 500; safe to send

      // optional product info (snapshot)
      productId: ui.productId,
      productName: ui.productName,
      imageUrl: ui.imageUrl,
      basePrice, // <-- important for backend snapshot
    };

    return apiService.request("/order/create", { method: "POST", body });
  },

  // If you want to post already-mapped data directly:
  createOrder: (body) =>
    apiService.request("/order/create", { method: "POST", body }),

  getOrderById: (id) => apiService.request(`/order/${id}`),

  trackOrderByOrderId: (orderId) =>
    apiService.request(`/order/track/${orderId}`),

  validateOrderData: (body) =>
    apiService.request("/order/validate", { method: "POST", body }),

  calculateOrderPrice: (body) =>
    apiService.request("/order/calculate-price", { method: "POST", body }),

  getAvailableDeliveryDates: () => apiService.request("/order/available-dates"),

  getCakeOptions: () => apiService.request("/order/cake-options"),
};

/* ---------------- Convenience re-exports for user admin ---------------- */
export const userMgmtAPI = {
  login: (email, password) => apiService.login({ email, password }),
  list: (q) => apiService.getUsers(q),
  get: (id) => apiService.getUser(id), // ✅ modern /user/:id
  create: (payload) => apiService.createUser(payload),
  update: (id, payload) => apiService.updateUser(id, payload),
  remove: (id) => apiService.deleteUser(id),
};

export default apiService;
