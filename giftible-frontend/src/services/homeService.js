// /services/homeService.js
import axios from "axios";

export const fetchCategories = async () => {
  const { data } = await axios.get("/api/categories/"); // Prefix with /api
  return data;
};

export const fetchFeaturedProducts = async () => {
  const { data } = await axios.get("/api/products/"); // Prefix with /api
  return data;
};

export const fetchTopNGOs = async () => {
  const { data } = await axios.get("/api/ngo/approved"); // Prefix with /api
  return data;
};
