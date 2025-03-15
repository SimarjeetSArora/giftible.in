// /services/homeService.js
import axiosInstance from "./axiosInstance";
export const fetchCategories = async () => {
  const { data } = await axiosInstance.get("/categories/"); // Prefix with /api
  return data;
};

export const fetchFeaturedProducts = async () => {
  const { data } = await axiosInstance.get("/products/"); // Prefix with /api
  return data;
};

export const fetchTopNGOs = async (limit = 5, offset = 0) => {
  try {
    const { data } = await axiosInstance.get("/ngo/approved", {
      params: { limit, offset }, // ✅ Send pagination params
    });

    return data;
  } catch (error) {
    console.error("❌ Error fetching top NGOs:", error);
    return { total: 0, ngos: [] }; // ✅ Return empty data on failure
  }
};

