import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

const getToken = () => localStorage.getItem("token");

export const getUserOrders = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/orders/user`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const getNGOOrders = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/orders/ngo`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/orders/ngo/${orderId}/update-status`,
    { status },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return response.data;
};



export const fetchOrderDetails = async (orderId) => {
    const { data } = await axiosInstance.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data;
  };

