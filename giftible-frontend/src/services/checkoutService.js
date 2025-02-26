import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

const getToken = () => localStorage.getItem("token");

// ✅ Fetch user addresses
export const fetchAddresses = async () => {
  const { data } = await axiosInstance.get(`${API_BASE_URL}/checkout/addresses`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return data;
};

// ✅ Add new address
export const addAddress = async (addressData) => {
  const { data } = await axiosInstance.post(`${API_BASE_URL}/checkout/address`, addressData, {
    headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
  });
  return data;
};

export const fetchAvailableCoupons = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/checkout/coupons/live`);
    return response.data;  // Returns an array of live coupons
  } catch (error) {
    console.error("❌ Error fetching coupons:", error);
    throw error.response?.data?.detail || "Failed to fetch coupons.";
  }
};

// ✅ Apply coupon
export const applyCoupon = async (couponCode) => {
  const { data } = await axiosInstance.post(
    `${API_BASE_URL}/checkout/apply-coupon`,
    { code: couponCode },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return data;
};

// ✅ Fetch cart summary
export const fetchCartSummary = async (couponCode = "") => {
  const { data } = await axiosInstance.get(`${API_BASE_URL}/checkout/cart-summary`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { coupon_code: couponCode },
  });
  return data;
};

// ✅ Place order
export const placeOrder = async ({ address_id, coupon_code, payment_id, order_id, amount, signature }) => {
  const { data } = await axiosInstance.post(
    `${API_BASE_URL}/orders/place-order`,
    { address_id, coupon_code, payment_id, order_id, amount, signature },  // Ensure all fields are present
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return data;
};


  

// ✅ Verify payment after completion
export const verifyPayment = async (paymentData) => {
    const { data } = await axiosInstance.post(
      `${API_BASE_URL}/payments/razorpay/verify`,
      paymentData,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  };


  export const initiateRazorpayPayment = async ({ amount }) => {
    const { data } = await axiosInstance.post(
      `${API_BASE_URL}/payments/razorpay/order`,
      { amount: Number(amount) },  // ✅ Ensure it's a number
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return data;
  };
  