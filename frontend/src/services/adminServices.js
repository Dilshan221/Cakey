const API_BASE_URL = 'http://localhost:8000/admins';

export const adminService = {
  // Get all admins
  getAllAdmins: async () =>
  {
    try
    {
      const response = await fetch(API_BASE_URL);
      if (!response.ok)
      {
        throw new Error('Failed to fetch admins');
      }
      const data = await response.json();
      return data.admins || [];
    } catch (error)
    {
      console.error('Error fetching admins:', error);
      return [];
    }
  },

  // Create new admin
  createAdmin: async (adminData) =>
  {
    try
    {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();

      if (!response.ok)
      {
        throw new Error(data.message || 'Failed to create admin');
      }

      return data;  // this goes back to AdminForm
    } catch (error)
    {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  // Get admin by ID
  getAdminById: async (id) =>
  {
    try
    {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok)
      {
        throw new Error('Failed to fetch admin');
      }
      const data = await response.json();
      return data.admin;
    } catch (error)
    {
      console.error('Error fetching admin by ID:', error);
      throw error;
    }
  },

  // Update admin
  updateAdmin: async (id, adminData) =>
  {
    try
    {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();

      if (!response.ok)
      {
        throw new Error(data.message || 'Failed to update admin');
      }

      return data;
    } catch (error)
    {
      console.error('Error updating admin:', error);
      throw error;
    }
  },

  // Delete admin
  deleteAdmin: async (id) =>
  {
    try
    {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok)
      {
        throw new Error('Failed to delete admin');
      }

      return await response.json();
    } catch (error)
    {
      console.error('Error deleting admin:', error);
      throw error;
    }
  }
};
