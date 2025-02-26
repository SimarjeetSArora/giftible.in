import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button, Container, Typography } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Login from "./pages/Login";
import UserRegister from "./pages/UserRegister";
import NGORegister from "./pages/NGORegister";
import AdminRegister from "./pages/AdminRegister";
import UserDashboard from "./pages/dashboards/UserDashboard";
import NGODashboard from "./pages/dashboards/NGODashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import AdminNGOApproval from "./pages/dashboards/AdminNGOApproval";
import ProductList from "./components/products/ProductList";
import ProductDetails from "./components/products/ProductDetails";
import AddProduct from "./components/products/AddProduct";
import ManageProducts from "./components/products/ManageProducts";
import ProductApproval from "./components/products/ProductApproval";
import Cart from "./components/cart/Cart";
import Checkout from "./components/checkout/Checkout";
import CreateCoupon from "./components/coupons/CreateCoupon";
import CouponList from "./components/coupons/CouponList";
import UserOrderHistory from "./components/orders/UserOrderHistory";
import NGOOrderManagement from "./components/orders/NGOOrderManagement";
import PaymentOptions from "./components/PaymentOptions/PaymentOptions";
import OrderSuccess from "./components/OrderSuccess";
import OrderDetails from "./components/orders/OrderDetails";
import { ThemeContextProvider } from "./context/ThemeContext";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/Footer";
import BecomeSeller from "./components/BecomeSeller";
import Homepage from "./components/Homepage";
import CategoriesPage from "./pages/CategoriesPage";
import AddCategory from "./components/categories/AddCategory";
import CategoryApproval from "./components/categories/CategoryApproval";
import NGOProducts from "./pages/NGOProducts";
import AllNGOs from "./pages/AllNGOs";
import DonatePage from "./pages/DonatePage";
import AboutUs from "./pages/AboutUs";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SearchResults from "./pages/SearchResults";

function App() {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  return (
    <ThemeContextProvider>
       <AuthProvider>
     
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/user" element={<UserRegister />} />
          <Route path="/register/ngo" element={<NGORegister />} />
          <Route path="/register/admin" element={<AdminRegister />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/ngos/:id/products" element={<NGOProducts />} />
          <Route path="/ngos" element={<AllNGOs />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/search" element={<SearchResults />} />
          

          {/* Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/ngos" element={<AdminNGOApproval />} />
            <Route path="/admin/products/approve" element={<ProductApproval />} />
            <Route path="/admin/create-coupon" element={<CreateCoupon />} />
            <Route path="/admin/coupons" element={<CouponList />} />
            <Route path="/admin/categories" element={<CategoryApproval />} />

          </Route>

          <Route element={<PrivateRoute allowedRoles={["ngo"]} />}>
            <Route path="/dashboard/ngo" element={<NGODashboard />} />
            <Route path="/ngo/products/add" element={<AddProduct ngoId={JSON.parse(localStorage.getItem("user"))?.id} />} />
            <Route path="/ngo/products/manage" element={<ManageProducts ngoId={JSON.parse(localStorage.getItem("user"))?.id} />} />
            <Route path="/dashboard/ngo/orders" element={<NGOOrderManagement />} />
            <Route path="/ngo/categories" element={<AddCategory />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["user"]} />}>
            <Route path="/dashboard/user" element={<UserDashboard />} />
            <Route path="/user/orders" element={<UserOrderHistory />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-options/:orderId" element={<PaymentOptions />} />
            <Route path="/order-success" element={<OrderSuccess />} /> {/* ✅ Add this route */}
            <Route path="/order-details/:orderId" element={<OrderDetails />} />
            
          </Route>

       
        </Routes>

        <Footer />

      </Router>
      </AuthProvider>
    </ThemeContextProvider>
        

  );
}

export default App;
