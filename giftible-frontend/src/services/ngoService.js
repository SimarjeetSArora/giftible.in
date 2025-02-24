// src/services/ngoService.js
import axios from "axios";
import API_BASE_URL from "../config";

export const fetchProductsByNGO = async (ngoId) => {
  const { data } = await axios.get(`${API_BASE_URL}/products/ngo/${ngoId}/products`);
  return data; // Expected response: { ngo_name, products: [{ id, name, price, images: [] }] }
};

export const fetchAllNGOs = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/ngo/approved`);
  return data; // Expected response: [{ id, ngo_name, logo }]
};
