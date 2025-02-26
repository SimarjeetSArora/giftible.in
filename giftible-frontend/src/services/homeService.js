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

export const fetchTopNGOs = async () => {
  const { data } = await axiosInstance.get("/ngo/approved"); // Prefix with /api
  return data;
};
