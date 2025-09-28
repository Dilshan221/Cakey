import { apiService } from "../../services/api";

/** Lightweight adapter so UI can call adminService.* */
export const adminService = {
  listAdmins(query = {}) {
    return apiService.getUsers(query);
  },
  getAdmin(id) {
    return apiService.getUser(id);
  },
  createAdmin(payload) {
    // Ensure a role exists if your backend expects it
    const body = { role: payload.role || "Admin", ...payload };
    return apiService.createUser(body);
  },
  updateAdmin(id, payload) {
    return apiService.updateUser(id, payload);
  },
  deleteAdmin(id) {
    return apiService.deleteUser(id);
  },
};

export default adminService;
