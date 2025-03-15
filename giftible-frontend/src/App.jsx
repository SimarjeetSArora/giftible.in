import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState } from "react";



import Login from "./pages/Login";
import UserRegister from "./pages/register/UserRegister";
import NGORegister from "./pages/register/NGORegister";
import AdminRegister from "./pages/register/AdminRegister";
import NGODashboard from "./pages/ngo/NGODashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import NGOApproval from "./pages/admin/ngos/NGOApproval";
import ProductList from "./pages/product/ProductList";
import ProductDetails from "./pages/product/ProductDetails";
import AddProduct from "./pages/ngo/product/AddProduct";
import ManageProducts from "./pages/ngo/product/ManageProductsStatus";
import ProductApproval from "./pages/admin/products/ProductApproval";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import CreateCoupon from "./pages/admin/coupons/CreateCoupon";
import CouponList from "./pages/admin/coupons/CouponList";
import UserOrderHistory from "./pages/user/orders/UserOrderHistory";
import NGOOrderManagement from "./pages/ngo/NGOOrderManagement";
import AdminOrderManagement from "./pages/admin/AdminOrderManagement";

import PaymentOptions from "./components/PaymentOptions/PaymentOptions";
import OrderDetails from "./pages/user/orders/OrderDetails";
import { ThemeContextProvider } from "./context/ThemeContext";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Footer from "./components/footer/Footer";
import BecomeSeller from "./pages/BecomeSeller";
import Homepage from "./pages/Homepage";
import CategoriesPage from "./pages/CategoriesPage";
import AddCategory from "./pages/ngo/categories/AddCategory";
import CategoryList from "./pages/ngo/categories/CategoryList";
import CategoryApproval from "./pages/admin/categories/CategoryApproval";
import ManageCategories from "./pages/admin/categories/ManageCategories";
import Profile from "./pages/Profile";
import AdminSales from "./pages/admin/AdminSales";
import NGOSales from "./pages/ngo/NGOSales";
import AdminPayouts from "./pages/admin/payouts/AdminPayouts";
import NGOPayouts from "./pages/ngo/NGOPayouts";
import PendingPayouts from "./pages/admin/payouts/PendingPayouts";

import AllNGOs from "./pages/AllNGOs";
import DonatePage from "./pages/DonatePage";
import AboutUs from "./pages/AboutUs";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SearchResults from "./pages/SearchResults";
import AddressPage from "./pages/user/address/AddressPage";
import CouponsPage from "./pages/user/coupons/CouponsPage";
import ManageNGOs from "./pages/admin/ngos/ManageNGOs";
import EditNGO from "./pages/admin/ngos/EditNGO";
import NGODetails from "./pages/admin/ngos/NGODetails";
import ManageUsers from "./pages/admin/users/ManageUsers";
import UserDetails from "./pages/admin/users/UserDetails";
import AdminManageProducts from "./pages/admin/products/AdminManageProducts";
import AdminProductDetails from "./pages/admin/products/AdminProductDetails";
import AdminEditProduct from "./pages/admin/products/AdminEditProduct";
import NGOManageProducts from "./pages/ngo/product/NGOManageProducts";
import NGOProductDetails from "./pages/ngo/product/NGOProductDetails";
import NGOEditProduct from "./pages/ngo/product/NGOEditProduct";
import Wishlist from "./pages/user/Wishlist";

import KeyboardNavigationProvider from "./accessibility/KeyboardNavigationProvider";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  
  

  return (
    <AuthProvider>
      <ThemeContextProvider>
      <KeyboardNavigationProvider />
      
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
              <Route path="/order-details/:orderId" element={<OrderDetails />} />
              <Route path="/addresses" element={<AddressPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/user/profile" element={<Profile />} />

            </Route>
           
            </Routes>

            <Box sx={{ ml: sidebarOpen ? "240px" : "70px", transition: "margin-left 0.3s ease", pt: "80px", px: 3 }}>
            <Routes>
            <Route element={<PrivateRoute allowedRoles={["ngo"]} />}>
              <Route path="/dashboard/ngo" element={<NGODashboard />} />
              <Route path="/ngo/products/add" element={<AddProduct />} />
              <Route path="/ngo/products/status" element={<ManageProducts />} />
              <Route path="/ngo/orders/manage" element={<NGOOrderManagement />} />
              <Route path="/ngo/categories" element={<CategoryList />} />
              <Route path="/ngo/categories/add" element={<AddCategory />} />
              <Route path="/ngo/products" element={<NGOManageProducts />} />
              <Route path="/ngo/product/details/:productId" element={<NGOProductDetails />} />
              <Route path="/ngo/edit/product/:productId" element={<NGOEditProduct />} />
              <Route path="/ngo/profile" element={<Profile />} />
              <Route path="/ngo/sales" element={<NGOSales />} />
              <Route path="/ngo/payouts" element={<NGOPayouts />} />


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
              <Route path="/admin/product/details/:productId" element={<AdminProductDetails />} />
              <Route path="/admin/edit/product/:productId" element={<AdminEditProduct />} />
              <Route path="/admin/orders/manage" element={<AdminOrderManagement />} />
              <Route path="/admin/profile" element={<Profile />} />
              <Route path="/admin/sales" element={<AdminSales />} />
              <Route path="/admin/payouts" element={<AdminPayouts />} />
              <Route path="/admin/payouts/pending" element={<PendingPayouts />} />


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
