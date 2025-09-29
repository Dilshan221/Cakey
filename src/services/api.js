const API_BASE_URL = "http://localhost:8000/api";

export const apiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  testConnection() {
    return this.request("/test");
  },

  // User routes
  getUsers() {
    return this.request("/user/getAllUsers");
  },

  getUserById(id) {
    return this.request(`/user/${id}`);
  },

  createUser(userData) {
    return this.request("/user/create", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser(id, userData) {
    return this.request(`/user/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser(id) {
    return this.request(`/user/delete/${id}`, {
      method: "DELETE",
    });
  },

  // Attendance routes
  getAttendanceRecords() {
    return this.request("/attendance/getAll");
  },

  markAttendance(attendanceData) {
    return this.request("/attendance/mark", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    });
  },

  getUserAttendance(userId) {
    return this.request(`/attendance/getUserAttendance/${userId}`);
  },

  updateAttendance(id, attendanceData) {
    return this.request(`/attendance/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(attendanceData),
    });
  },

  // Salary routes
  getSalaries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/salary/getAll${queryString ? `?${queryString}` : ''}`);
  },

  createSalary(salaryData) {
    return this.request("/salary/create", {
      method: "POST",
      body: JSON.stringify(salaryData),
    });
  },

  updateSalary(id, salaryData) {
    return this.request(`/salary/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(salaryData),
    });
  },

  deleteSalary(id) {
    return this.request(`/salary/delete/${id}`, {
      method: "DELETE",
    });
  },

  getUserSalaryHistory(userId) {
    return this.request(`/salary/getUserHistory/${userId}`);
  },

  // Finance routes
  getFinanceRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/finance/getAll${queryString ? `?${queryString}` : ''}`);
  },

  createFinanceRecord(financeData) {
    return this.request("/finance/create", {
      method: "POST",
      body: JSON.stringify(financeData),
    });
  },

  updateFinanceRecord(id, financeData) {
    return this.request(`/finance/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(financeData),
    });
  },

  deleteFinanceRecord(id) {
    return this.request(`/finance/delete/${id}`, {
      method: "DELETE",
    });
  },

  getFinanceSummary(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/finance/summary${queryString ? `?${queryString}` : ''}`);
  },

  // Discount routes
  getDiscounts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/discount/getAll${queryString ? `?${queryString}` : ''}`);
  },

  createDiscount(discountData) {
    return this.request("/discount/create", {
      method: "POST",
      body: JSON.stringify(discountData),
    });
  },

  updateDiscount(id, discountData) {
    return this.request(`/discount/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(discountData),
    });
  },

  deleteDiscount(id) {
    return this.request(`/discount/delete/${id}`, {
      method: "DELETE",
    });
  },

  validateDiscount(code, amount) {
    return this.request("/discount/validate", {
      method: "POST",
      body: JSON.stringify({ code, amount }),
    });
  },
};
