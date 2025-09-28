// src/utils/authStorage.js
// Centralized auth storage helpers used by the app & login page.

import { useMemo } from "react";
import { apiService } from "../services/api"; // used by applyToApiService()

/* ---------- Keys (match your Login.jsx) ---------- */
export const EMAIL_KEY = "cb_remember_email";
export const TOKEN_KEY = "cb_token";
export const USER_KEY = "cb_user";

/* ---------- Low-level storage helpers ---------- */
const read = (key) => localStorage.getItem(key) ?? sessionStorage.getItem(key);

const write = (key, value, persist = true) => {
  // Clear both, then write to chosen storage (default: localStorage)
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  if (value !== null && value !== undefined) {
    const target = persist ? localStorage : sessionStorage;
    target.setItem(key, value);
  }
};

const removeAll = () => {
  [EMAIL_KEY, TOKEN_KEY, USER_KEY].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
};

/* ---------- Public API ---------- */
export const authStorage = {
  EMAIL_KEY,
  TOKEN_KEY,
  USER_KEY,
  read,
  write,
  removeAll,

  /* token */
  setToken(token, persist = true) {
    write(TOKEN_KEY, token, persist);
  },
  getToken() {
    return read(TOKEN_KEY);
  },

  /* user */
  setUser(user, persist = true) {
    write(USER_KEY, JSON.stringify(user), persist);
  },
  getUser() {
    try {
      return JSON.parse(read(USER_KEY) || "null");
    } catch {
      return null;
    }
  },

  /* remember email */
  setEmail(email, persist = true) {
    write(EMAIL_KEY, email, persist);
  },
  getEmail() {
    return read(EMAIL_KEY);
  },

  /* misc */
  isAuthenticated() {
    return !!read(TOKEN_KEY);
  },
  logout() {
    removeAll();
    try {
      if (apiService?.setAuthToken) apiService.setAuthToken(null);
      if (apiService?.defaults?.headers?.common) {
        delete apiService.defaults.headers.common.Authorization;
      }
    } catch {}
  },

  /* Optional convenience login mirroring your page logic */
  async login({ email, password, remember = false }, persist = true) {
    if (!email || !password) {
      return { success: false, error: "Please fill in all fields." };
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    try {
      const data = await apiService.request("/usermanagement/login", {
        method: "POST",
        body: { email, password },
      });

      if (remember) this.setEmail(email, true);
      else this.setEmail("", true);

      if (data?.token) this.setToken(data.token, persist);
      if (data?.user) this.setUser(data.user, persist);

      this.applyToApiService();
      return { success: true, data };
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "Login failed. Please try again.";
      return { success: false, error: msg };
    }
  },

  /** Apply stored token to apiService so future requests are authenticated */
  applyToApiService(customApi = apiService) {
    const token = this.getToken();
    if (!customApi || !token) return;

    try {
      if (typeof customApi.setAuthToken === "function") {
        customApi.setAuthToken(token);
        return;
      }
      if (customApi.defaults?.headers?.common) {
        customApi.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
      }
      if (typeof customApi.setDefaultHeader === "function") {
        customApi.setDefaultHeader("Authorization", `Bearer ${token}`);
      }
    } catch {}
  },
};

/* ---------- Optional React hook ---------- */
export function useAuth() {
  return useMemo(
    () => ({
      isAuthenticated: authStorage.isAuthenticated.bind(authStorage),
      getToken: authStorage.getToken.bind(authStorage),
      getUser: authStorage.getUser.bind(authStorage),
      setToken: authStorage.setToken.bind(authStorage),
      setUser: authStorage.setUser.bind(authStorage),
      setEmail: authStorage.setEmail.bind(authStorage),
      getEmail: authStorage.getEmail.bind(authStorage),
      login: authStorage.login.bind(authStorage),
      logout: authStorage.logout.bind(authStorage),
      applyToApiService: authStorage.applyToApiService.bind(authStorage),
    }),
    []
  );
}
