import React, { useState, useEffect } from "react";
import {
  Drawer, List, ListItemButton, ListItemText, ListItemIcon, Collapse, Box, Tooltip
} from "@mui/material";
import {
  ExpandLess, ExpandMore, People, Category, LocalOffer, Notifications,
  ShoppingCart, Dashboard, Storefront, Person, CheckCircle, PlaylistAddCheck, Assignment
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";

const NGOSidebar = ({ open }) => {
  const location = useLocation(); // Get current route

  // State for collapsible sections
  const [openNGO, setOpenNGO] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);

  // Close collapsible menus when sidebar collapses
  useEffect(() => {
    if (!open) {
      setOpenNGO(false);
      setOpenCategories(false);
      setOpenOrders(false);
      setOpenProducts(false);
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
            <ListItemButton
              component={NavLink}
              to="/dashboard/admin"
              selected={location.pathname === "/dashboard/admin"}
            >
              <ListItemIcon sx={{ color: "#F5B800" }}><Dashboard /></ListItemIcon>
              {open && <ListItemText primary="Dashboard" />}
            </ListItemButton>
          </Tooltip>

          {/* NGOs (Collapsible) */}
          <ListItemButton onClick={() => setOpenNGO(!openNGO)}>
            <ListItemIcon sx={{ color: "#F5B800" }}><People /></ListItemIcon>
            {open && <ListItemText primary="NGOs" />}
            {open ? (openNGO ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
          <Collapse in={openNGO} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItemButton
                component={NavLink}
                to="/dashboard/admin/ngos"
                selected={location.pathname === "/dashboard/admin/ngos"}
                sx={{ pl: open ? 4 : 2 }}
              >
                <ListItemIcon sx={{ color: "#F5B800" }}><CheckCircle /></ListItemIcon>
                <ListItemText primary="Approve NGOs" />
              </ListItemButton>
              <ListItemButton
                component={NavLink}
                to="/admin/ngos/manage"
                selected={location.pathname === "/admin/ngos/manage"}
                sx={{ pl: open ? 4 : 2 }}
              >
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
              <ListItemButton
                component={NavLink}
                to="/admin/categories"
                selected={location.pathname === "/admin/categories"}
                sx={{ pl: open ? 4 : 2 }}
              >
                <ListItemIcon sx={{ color: "#F5B800" }}><CheckCircle /></ListItemIcon>
                <ListItemText primary="Approve Categories" />
              </ListItemButton>
              <ListItemButton
                component={NavLink}
                to="/admin/categories/manage"
                selected={location.pathname === "/admin/categories/manage"}
                sx={{ pl: open ? 4 : 2 }}
              >
                <ListItemIcon sx={{ color: "#F5B800" }}><PlaylistAddCheck /></ListItemIcon>
                <ListItemText primary="Manage Categories" />
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

          {/* Notifications */}
          <Tooltip title={!open ? "Notifications" : ""} placement="right">
            <ListItemButton component={NavLink} to="/admin/notifications/list" selected={location.pathname === "/admin/notifications/list"}>
              <ListItemIcon sx={{ color: "#F5B800" }}><Notifications /></ListItemIcon>
              {open && <ListItemText primary="Notifications List" />}
            </ListItemButton>
          </Tooltip>

          {/* Orders (Collapsible) */}
          <ListItemButton onClick={() => setOpenOrders(!openOrders)}>
            <ListItemIcon sx={{ color: "#F5B800" }}><ShoppingCart /></ListItemIcon>
            {open && <ListItemText primary="Orders" />}
            {open ? (openOrders ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
          <Collapse in={openOrders} timeout="auto" unmountOnExit>
            <List disablePadding>
              <ListItemButton
                component={NavLink}
                to="/admin/orders/manage"
                selected={location.pathname === "/admin/orders/manage"}
                sx={{ pl: open ? 4 : 2 }}
              >
                <ListItemIcon sx={{ color: "#F5B800" }}><Assignment /></ListItemIcon>
                <ListItemText primary="Manage Orders" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Manage Users */}
          <Tooltip title={!open ? "Manage Users" : ""} placement="right">
            <ListItemButton component={NavLink} to="/admin/users/manage" selected={location.pathname === "/admin/users/manage"}>
              <ListItemIcon sx={{ color: "#F5B800" }}><Person /></ListItemIcon>
              {open && <ListItemText primary="Manage Users" />}
            </ListItemButton>
          </Tooltip>
        </List>
      </Drawer>
    </Box>
  );
};

export default NGOSidebar;
