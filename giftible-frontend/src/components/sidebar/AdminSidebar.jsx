import React, { useState, useEffect } from "react";
import {
  Drawer, List, ListItemButton, ListItemText, ListItemIcon, Collapse, Box, Tooltip
} from "@mui/material";
import {
  ExpandLess, ExpandMore, People, Category, LocalOffer, MonetizationOn, VolunteerActivism, ShowChart,
  ShoppingCart, Dashboard, Storefront, CheckCircle, PlaylistAddCheck, BarChart, AttachMoney, AccountBalance
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";

const AdminSidebar = ({ open }) => {
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
            <ListItemButton component={NavLink} to="/dashboard/admin" selected={location.pathname === "/dashboard/admin"}>
              <ListItemIcon sx={{ color: "#F5B800" }}><Dashboard /></ListItemIcon>
              {open && <ListItemText primary="Dashboard" />}
            </ListItemButton>
          </Tooltip>

           {/* Analytics */}
                    <Tooltip title={!open ? "Analytics" : ""} placement="right">
                      <ListItemButton component={NavLink} to="/admin/analytics" selected={location.pathname === "/ngo/analytics"}>
                        <ListItemIcon sx={{ color: "#F5B800" }}><ShowChart /></ListItemIcon>
                        {open && <ListItemText primary="Analytics" />}
                      </ListItemButton>
                    </Tooltip>


          <Tooltip title={!open ? "Manage Users" : ""} placement="right">
            <ListItemButton component={NavLink} to="/admin/manage-users" selected={location.pathname === "/admin/manage-ngos"}>
              <ListItemIcon sx={{ color: "#F5B800" }}><People /></ListItemIcon>
              {open && <ListItemText primary="Manage Users" />}
            </ListItemButton>
          </Tooltip>

          {/* NGOs (Collapsible) */}
          <ListItemButton onClick={() => setOpenNGO(!openNGO)}>
            <ListItemIcon sx={{ color: "#F5B800" }}><VolunteerActivism /></ListItemIcon>
            {open && <ListItemText primary="NGOs" />}
            {open ? (openNGO ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
          <Collapse in={openNGO} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItemButton component={NavLink} to="/dashboard/admin/ngos" selected={location.pathname === "/dashboard/admin/ngos"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><CheckCircle /></ListItemIcon>
                <ListItemText primary="Approve NGOs" />
              </ListItemButton>
              <ListItemButton component={NavLink} to="/admin/manage-ngos" selected={location.pathname === "/admin/ngos/manage"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><PlaylistAddCheck /></ListItemIcon>
                <ListItemText primary="Manage NGOs" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Categories (Collapsible) */}
          <ListItemButton onClick={() => setOpenCategories(!openCategories)}>
            <ListItemIcon sx={{ color: "#F5B800" }}><Category /></ListItemIcon>
            {open && <ListItemText primary="Categories" />}
            {open ? (openCategories ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
          <Collapse in={openCategories} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItemButton component={NavLink} to="/admin/categories" selected={location.pathname === "/admin/categories"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><CheckCircle /></ListItemIcon>
                <ListItemText primary="Approve Categories" />
              </ListItemButton>
              <ListItemButton component={NavLink} to="/admin/categories/manage" selected={location.pathname === "/admin/categories/manage"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><PlaylistAddCheck /></ListItemIcon>
                <ListItemText primary="Manage Categories" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Products (Collapsible) */}
          <ListItemButton onClick={() => setOpenProducts(!openProducts)}>
            <ListItemIcon sx={{ color: "#F5B800" }}><Storefront /></ListItemIcon>
            {open && <ListItemText primary="Products" />}
            {open ? (openProducts ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
          <Collapse in={openProducts} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItemButton component={NavLink} to="/admin/products/approve" selected={location.pathname === "/admin/products/approve"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><CheckCircle /></ListItemIcon>
                <ListItemText primary="Approve Products" />
              </ListItemButton>
              <ListItemButton component={NavLink} to="/admin/products" selected={location.pathname === "/admin/products/manage"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><PlaylistAddCheck /></ListItemIcon>
                <ListItemText primary="Manage Products" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Manage Coupons */}
          <Tooltip title={!open ? "Manage Coupons" : ""} placement="right">
            <ListItemButton component={NavLink} to="/admin/coupons" selected={location.pathname === "/admin/coupons"}>
              <ListItemIcon sx={{ color: "#F5B800" }}><LocalOffer /></ListItemIcon>
              {open && <ListItemText primary="Manage Coupons" />}
            </ListItemButton>
          </Tooltip>

          {/* Orders */}
          <Tooltip title={!open ? "Orders" : ""} placement="right">
            <ListItemButton component={NavLink} to="/admin/orders/manage" selected={location.pathname === "/admin/orders/manage"}>
                <ListItemIcon sx={{ color: "#F5B800" }}><ShoppingCart /></ListItemIcon>
                <ListItemText primary="Orders" />
              </ListItemButton>
          </Tooltip>


           {/* Sales */}
           <Tooltip title={!open ? "Sales" : ""} placement="right">
            <ListItemButton component={NavLink} to="/admin/sales" selected={location.pathname === "/admin/sales"}>
                <ListItemIcon sx={{ color: "#F5B800" }}><BarChart /></ListItemIcon>
                <ListItemText primary="Sales" />
              </ListItemButton>
          </Tooltip>

          {/* Payouts */}
          <ListItemButton onClick={() => setOpenPayouts(!openPayouts)}>
            <ListItemIcon sx={{ color: "#F5B800" }}><AttachMoney /></ListItemIcon>
            {open && <ListItemText primary="Payouts" />}
            {open ? (openPayouts ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
          <Collapse in={openPayouts} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItemButton component={NavLink} to="/admin/payouts/pending" selected={location.pathname === "/admin/payouts/pending"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><MonetizationOn /></ListItemIcon>
                <ListItemText primary="Pending Payouts" />
              </ListItemButton>
              <ListItemButton component={NavLink} to="/admin/payouts" selected={location.pathname === "/admin/payouts"} sx={{ pl: open ? 4 : 2 }}>
                <ListItemIcon sx={{ color: "#F5B800" }}><AccountBalance /></ListItemIcon>
                <ListItemText primary="View Payouts" />
              </ListItemButton>
            </List>
          </Collapse>
         

        </List>
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;
