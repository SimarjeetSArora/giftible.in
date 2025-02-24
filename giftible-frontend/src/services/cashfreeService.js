
import axios from "axios";
import API_BASE_URL from "../config";

const getToken = () => localStorage.getItem("token");

export const initiateCashfreePayment = async (orderId, amount) => {
  const response = await axios.post(
    `${API_BASE_URL}/payments/initiate`,
    { order_id: orderId, amount },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return response.data;
};

export const verifyPaymentStatus = async (orderId) => {
  const response = await axios.get(`${API_BASE_URL}/payments/status/${orderId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};
