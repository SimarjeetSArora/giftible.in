import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState } from "react";




import Login from "./pages/Login";
import UserRegister from "./pages/register/UserRegister";
import NGORegister from "./pages/register/NGORegister";
import AdminRegister from "./pages/register/AdminRegister";
import NGODashboard from "./pages/dashboards/NGODashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import NGOApproval from "./pages/admin/ngos/NGOApproval";
import ProductList from "./components/products/ProductList";
import ProductDetails from "./components/products/ProductDetails";
import AddProduct from "./components/products/AddProduct";
import ManageProducts from "./components/products/ManageProducts";
import ProductApproval from "./components/products/ProductApproval";
import Cart from "./components/cart/Cart";
import Checkout from "./components/checkout/Checkout";
import CreateCoupon from "./pages/admin/coupons/CreateCoupon";
import CouponList from "./pages/admin/coupons/CouponList";
import UserOrderHistory from "./components/orders/UserOrderHistory";
import NGOOrderManagement from "./components/orders/NGOOrderManagement";
import PaymentOptions from "./components/PaymentOptions/PaymentOptions";
import OrderSuccess from "./components/OrderSuccess";
import OrderDetails from "./components/orders/OrderDetails";
import { ThemeContextProvider } from "./context/ThemeContext";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Footer from "./components/footer/Footer";
import BecomeSeller from "./components/BecomeSeller";
import Homepage from "./components/Homepage";
import CategoriesPage from "./pages/CategoriesPage";
import AddCategory from "./pages/admin/categories/AddCategory";
import CategoryApproval from "./pages/admin/categories/CategoryApproval";
import ManageCategories from "./pages/admin/categories/ManageCategories";

import NGOProducts from "./pages/NGOProducts";
import AllNGOs from "./pages/AllNGOs";
import DonatePage from "./pages/DonatePage";
import AboutUs from "./pages/AboutUs";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SearchResults from "./pages/SearchResults";
import AddressPage from "./components/AddressPage";
import CouponsPage from "./pages/user/coupons/CouponsPage";
import ManageNGOs from "./pages/admin/ngos/ManageNGOs";
import EditNGO from "./pages/admin/ngos/EditNGO";
import NGODetails from "./pages/admin/ngos/NGODetails";
import ManageUsers from "./pages/admin/users/ManageUsers";
import UserDetails from "./pages/admin/users/UserDetails";
import AdminManageProducts from "./pages/product/AdminManageProducts";
import Wishlist from "./pages/user/Wishlist";



function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <ThemeContextProvider>
        <Router>
                  {/* Navbar + Sidebar Container */}
                  <Box sx={{ display: "flex" }}>
            <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <Sidebar sidebarOpen={sidebarOpen} />
          </Box>
  {/* Page Content */}
          
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
            <Route element={<PrivateRoute allowedRoles={["user"]} />}>
              <Route path="/user/orders" element={<UserOrderHistory />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-options/:orderId" element={<PaymentOptions />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/order-details/:orderId" element={<OrderDetails />} />
              <Route path="/addresses" element={<AddressPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/wishlist" element={<Wishlist />} />

            </Route>
           
            </Routes>

            <Box sx={{ ml: sidebarOpen ? "240px" : "70px", transition: "margin-left 0.3s ease", pt: "80px", px: 3 }}>
            <Routes>
            <Route element={<PrivateRoute allowedRoles={["ngo"]} />}>
              <Route path="/dashboard/ngo" element={<NGODashboard />} />
              <Route path="/ngo/products/add" element={<AddProduct />} />
              <Route path="/ngo/products/manage" element={<ManageProducts />} />
              <Route path="/dashboard/ngo/orders" element={<NGOOrderManagement />} />
              <Route path="/ngo/categories" element={<AddCategory />} />
            </Route>

            
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/ngos" element={<NGOApproval />} />
              <Route path="/admin/products/approve" element={<ProductApproval />} />
              <Route path="/admin/create-coupon" element={<CreateCoupon />} />
              <Route path="/admin/coupons" element={<CouponList />} />
              <Route path="/admin/categories" element={<CategoryApproval />} />
              <Route path="/admin/manage-ngos" element={<ManageNGOs />} />
              <Route path="/admin/edit/ngo/:ngoId" element={<EditNGO />} />
              <Route path="/admin/ngos/details/:id" element={<NGODetails />} />
              <Route path="/admin/categories/manage" element={<ManageCategories />} />
              <Route path="/admin/manage-users" element={<ManageUsers />} />
              <Route path="/admin/users/details/:id" element={<UserDetails />} />
              <Route path="/admin/products" element={<AdminManageProducts />} />

            </Route>
          </Routes>
          </Box>
          <Footer />
        </Router>
      </ThemeContextProvider>
    </AuthProvider>
  );
}



export default App;
