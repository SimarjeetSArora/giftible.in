import React, { useState, useEffect } from "react";
import {
  Drawer, List, ListItemButton, ListItemText, ListItemIcon, Collapse, Box, Tooltip
} from "@mui/material";
import {
  ExpandLess, ExpandMore, People, Category, LocalOffer, Notifications,
  ShoppingCart, Dashboard, Storefront, Person, CheckCircle, PlaylistAddCheck, Assignment, BarChart, AttachMoney
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";

const NGOSidebar = ({ open }) => {
  const location = useLocation(); // Get current route

  // State for collapsible sections
  const [openNGO, setOpenNGO] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);
  const [openProducts, setOpenProducts] = useState(false); // Added Products Section
  const [openSales, setOpenSales] = useState(false); // Added Products Section
  const [openPayouts, setOpenPayouts] = useState(false); // Added Products Section

  // Close collapsible menus when sidebar collapses
  useEffect(() => {
    if (!open) {
      setOpenNGO(false);
      setOpenCategories(false);
      setOpenOrders(false);
      setOpenProducts(false);
      setOpenSales(false);
      setOpenPayouts(false);
    }
  }, [open]);

  return (
    <Box sx={{ display: "flex", mt: "60px" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? 240 : 70,
          flexShrink: 0,
          transition: "width 0.3s ease-in-out",
          [`& .MuiDrawer-paper`]: {
            width: open ? 240 : 70,
            bgcolor: "#6A4C93",
            color: "#FFFFFF",
            mt: "60px",
            overflow: "hidden",
            boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <List
          sx={{
            height: "calc(100vh - 60px)",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#F5B800", borderRadius: "10px" },
          }}
        >
          {/* Dashboard */}
          <Tooltip title={!open ? "Dashboard" : ""} placement="right">
            <ListItemButton component={NavLink} to="/dashboard/ngo" selected={location.pathname === "/dashboard/ngo"}>
              <ListItemIcon sx={{ color: "#F5B800" }}><Dashboard /></ListItemIcon>
              {open && <ListItemText primary="Dashboard" />}
            </ListItemButton>
          </Tooltip>

          
          
          {/* Products (Collapsible) */}
          <ListItemButton onClick={() => setOpenProducts(!openProducts)}>
            <ListItemIcon sx={{ color: "#F5B800" }}><Storefront /></ListItemIcon>
            {open && <ListItemText primary="Products" />}
            {open ? (openProducts ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
          <Collapse in={openProducts} timeout="auto" unmountOnExit>
            <List disablePadding>
            <ListItemButton component={NavLink} to="/ngo/products/add" selected={location.pathname === "/ngo/products/add"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><CheckCircle /></ListItemIcon>
                <ListItemText primary="Add Products" />
              </ListItemButton>
              <ListItemButton component={NavLink} to="/ngo/products/status" selected={location.pathname === "/ngo/products/status"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><CheckCircle /></ListItemIcon>
                <ListItemText primary="Update Status" />
              </ListItemButton>
              <ListItemButton component={NavLink} to="/ngo/products" selected={location.pathname === "/ngo/products"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><PlaylistAddCheck /></ListItemIcon>
                <ListItemText primary="Manage Products" />
              </ListItemButton>
            </List>
          </Collapse>



          {/* Add and View Category */}
          <Tooltip title={!open ? "Categories" : ""} placement="right">
            <ListItemButton component={NavLink} to="/ngo/categories/" selected={location.pathname === "/ngo/categories"}>
              <ListItemIcon sx={{ color: "#F5B800" }}><Category /></ListItemIcon>
              {open && <ListItemText primary="Categories" />}
            </ListItemButton>
          </Tooltip>          


           {/* Orders */}
          <Tooltip title={!open ? "Orders" : ""} placement="right">
            <ListItemButton component={NavLink} to="/ngo/orders/manage" selected={location.pathname === "/ngo/orders/manage"}>
                <ListItemIcon sx={{ color: "#F5B800" }}><ShoppingCart /></ListItemIcon>
                <ListItemText primary="Orders" />
              </ListItemButton>
          </Tooltip>


           {/* Sales */}
          <Tooltip title={!open ? "Sales" : ""} placement="right">
             <ListItemButton component={NavLink} to="/ngo/sales" selected={location.pathname === "/ngo/sales"}>
               <ListItemIcon sx={{ color: "#F5B800" }}><BarChart /></ListItemIcon>
                 <ListItemText primary="Sales" />
             </ListItemButton>
          </Tooltip>
          
          {/* Payouts */}
          <Tooltip title={!open ? "Payouts" : ""} placement="right">
             <ListItemButton component={NavLink} to="/ngo/payouts" selected={location.pathname === "/ngo/payouts"}>
               <ListItemIcon sx={{ color: "#F5B800" }}><AttachMoney /></ListItemIcon>
                 <ListItemText primary="Payouts" />
             </ListItemButton>
          </Tooltip>



        </List>
      </Drawer>
    </Box>
  );
};

export default NGOSidebar;
