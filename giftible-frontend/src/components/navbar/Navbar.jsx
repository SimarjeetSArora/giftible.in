// src/components/Navbar/Navbar.js

import React from "react";
import UserNavbar from "./UserNavbar";
import NGONavbar from "./NGONavbar";
import AdminNavbar from "./AdminNavbar";
import NotLoggedInNavbar from "./NotLoggedInNavbar";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ toggleSidebar }) => {
    const { authRole } = useAuth();
  
    if (authRole === "user") return <UserNavbar />;
    if (authRole === "ngo") return <NGONavbar toggleSidebar={toggleSidebar} />;
    if (authRole === "admin") return <AdminNavbar toggleSidebar={toggleSidebar} />;
  
    return <NotLoggedInNavbar />;
};

export default Navbar;
