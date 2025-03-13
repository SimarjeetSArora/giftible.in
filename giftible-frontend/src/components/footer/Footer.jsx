// src/components/Navbar/Navbar.js

import React from "react";
import DefaultFooter from "./DefaultFooter";
import NGOFooter from "./NGOFooter";
import AdminFooter from "./AdminFooter";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
    const { authRole } = useAuth();
  
    if (authRole === "ngo") return <NGOFooter />;
    if (authRole === "admin") return <AdminFooter />;
  
    return <DefaultFooter />;
  };

export default Footer;
