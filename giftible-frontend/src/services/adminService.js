import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

const getToken = () => localStorage.getItem("access_token");


// ✅ Fetch All NGOs (With Optional Filters)
export const fetchAllNGOs = async (filter, startDate, endDate, limit = 10, offset = 0) => {
  try {
    const params = new URLSearchParams();

    if (filter !== "all") params.append("verified", filter === "verified" ? "true" : "false");
    if (startDate) params.append("start_date", encodeURIComponent(startDate));
    if (endDate) params.append("end_date", encodeURIComponent(endDate));
    params.append("limit", limit); // ✅ Add limit
    params.append("offset", offset); // ✅ Add offset

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get(`${API_BASE_URL}/admin/ngos${queryString}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching NGOs:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch NGOs. Please try again.");
  }
};


// ✅ Search NGOs (By Name, City, Email, Contact)
export const searchNGOs = async (query) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/admin/ngos/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error("Error searching NGOs:", error);
    throw new Error(error.response?.data?.detail || "Search failed. Please try again.");
  }
};

// ✅ Delete NGO (With Error Handling)
export const deleteNGO = async (ngoId, deletionReason = "No specific reason provided") => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE_URL}/admin/ngos/${ngoId}?deletion_reason=${encodeURIComponent(deletionReason)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting NGO:", error);
      throw new Error(error.response?.data?.detail || "NGO deletion failed. Ensure all linked products are removed first.");
    }
  };
  
  
  
// ✅ Fetch NGO details by ID before editing
export const fetchNGODetails = async (ngoId) => {
  if (!ngoId) {
    console.error("❌ Error: NGO ID is undefined!");
    throw new Error("NGO ID is required to fetch details.");
  }

  try {
    const { data } = await axiosInstance.get(`${API_BASE_URL}/admin/ngos/${ngoId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });

    // ✅ Ensure correct formatting for logo and license URLs
    const BASE_URL = API_BASE_URL.replace("/api", ""); // Adjust based on your backend structure

    return {
      ...data,
      logo: data.logo ? `${BASE_URL}${data.logo}` : "/default-logo.png",
      license: data.license
        ? `${BASE_URL}${data.license}`
        : null, // Leave null if no license is available
      isLicensePDF: data.license?.endsWith(".pdf") ?? false, // ✅ Check if license is a PDF
    };
  } catch (error) {
    console.error("❌ Error fetching NGO details:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch NGO details.");
  }
};

  
  
  
  
  // ✅ Update NGO details
  export const updateNGO = async (ngoId, formData) => {
    return axiosInstance.put(`${API_BASE_URL}/admin/ngos/${ngoId}`, formData, {
      headers: {
        Authorization: `Bearer ${getToken()}`, 
        "Content-Type": "multipart/form-data",
      },
    });
  };
  


// ✅ Fetch Admin Dashboard Statistics
export const fetchAdminDashboardStats = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/admin/dashboard-stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      return {
        pendingNGOs: 0,
        totalNGOs: 0,
        unverifiedUsers: 0,
        totalUsers: 0,
        approvedProducts: 0,
        liveProducts: 0,
        unliveProducts: 0,
        totalProducts: 0,
        approvedCategories: 0,
        totalCategories: 0,
        undeliveredOrders: 0,
      };
    }
  };
  
  export const fetchPendingNGOs = async () => {
    try {
      const { data } = await axiosInstance.get(`${API_BASE_URL}/admin/ngos/pending`);
      return data;
    } catch (error) {
      console.error("❌ Error fetching NGOs:", error);
      throw error;
    }
  };
  
  export const approveNGO = async (ngoId) => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/admin/approve-ngo/${ngoId}`);
    } catch (error) {
      console.error("❌ Error approving NGO:", error);
      throw error;
    }
  };
  
  export const rejectNGO = async (ngoId, rejectionReason) => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/admin/reject-ngo/${ngoId}`, {
        rejection_reason: rejectionReason,
      });
    } catch (error) {
      console.error("❌ Error rejecting NGO:", error);
      throw error;
    }
  };


// ✅ Fetch All Users (With Optional Filters)
export const fetchAllUsers = async ({ role, start_date, end_date, limit = 10, offset = 0 }) => {
  try {
    const params = new URLSearchParams();

    if (start_date) params.append("start_date", encodeURIComponent(start_date));
    if (end_date) params.append("end_date", encodeURIComponent(end_date));
    params.append("limit", limit);
    params.append("offset", offset);
    params.append("role", role); // ✅ Ensure only users with `role=user` are fetched

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get(`${API_BASE_URL}/admin/users${queryString}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching Users:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch Users. Please try again.");
  }
};



// ✅ Fetch NGO details by ID before editing
export const fetchUserDetails = async (userId) => {
  if (!userId) {
    console.error("❌ Error: User ID is undefined!");
    throw new Error("User ID is required to fetch details.");
  }

  try {
    const { data } = await axiosInstance.get(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });

    return data; // ✅ Directly return user details
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch user details.");
  }
};


// ✅ Delete User (With Error Handling)
export const deleteUser = async (userId, deletionReason = "No specific reason provided") => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/admin/users/${userId}?deletion_reason=${encodeURIComponent(deletionReason)}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting User:", error);
    throw new Error(error.response?.data?.detail || "User deletion failed. Please try again.");
  }
};
