// src/components/Navbar/Sidebar.js

import React, { useState } from "react";
import NGOSidebar from "./NGOSidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ sidebarOpen }) => {
  const { authRole } = useAuth();

  if (authRole === "ngo") return <NGOSidebar open={sidebarOpen} />;
  if (authRole === "admin") return <AdminSidebar open={sidebarOpen} />;

  return null; // Default return to avoid issues
};

export default Sidebar;
