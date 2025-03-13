import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
  useTheme
} from "@mui/material";
import { Add, Delete, Edit, LocationOn } from "@mui/icons-material";
import axiosInstance from "../services/axiosInstance";
import AddressForm from "./AddressForm";

const AddressesPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);


const fetchAddresses = async () => {
  try {
    const response = await axiosInstance.get("/addresses/");
    const data = response.data;

    // ✅ Ensure it's an array
    if (Array.isArray(data)) {
      setAddresses(data);
    } else {
      setAddresses([]); // ✅ Prevent errors if response is not an array
    }

    const defaultAddress = data.find((address) => address.is_default);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id);
    }
  } catch (error) {
    console.error("❌ Failed to load addresses:", error);
    setAddresses([]); // ✅ Ensure state is always an array
    setSnackbar({ open: true, message: "❌ Failed to load addresses.", severity: "error" });
  }
};


  const handleAddOrEditAddress = async (newAddress) => {
    try {
      if (editMode) {
        await axiosInstance.put(`/addresses/${currentAddress.id}`, newAddress);
      } else {
        await axiosInstance.post("/addresses/", newAddress);
      }
      fetchAddresses();
      setSnackbar({ open: true, message: editMode ? "✅ Address updated!" : "✅ Address added!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "❌ Failed to save address.", severity: "error" });
    }
    setOpen(false);
    setEditMode(false);
    setCurrentAddress(null);
  };

  const handleEdit = async (id) => {
    try {
      const response = await axiosInstance.get(`/addresses/`);
      const addressToEdit = response.data.find((address) => address.id === id);
      if (addressToEdit) {
        setCurrentAddress(addressToEdit);
        setEditMode(true);
        setOpen(true);
      }
    } catch (error) {
      setSnackbar({ open: true, message: "❌ Failed to load address details.", severity: "error" });
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await axiosInstance.delete(`/addresses/${id}`);
      setAddresses(addresses.filter((address) => address.id !== id));
      setSnackbar({ open: true, message: "✅ Address deleted!", severity: "success" });
    } catch (error) {
      if (error.response?.status === 400) {
        setSnackbar({ open: true, message: "An order is already placed with this address", severity: "error" });
      } else {
        setSnackbar({ open: true, message: "Failed to delete address.", severity: "error" });
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.put(`/addresses/${id}/set-default`);

      setSelectedAddress(id);
      setAddresses((prevAddresses) =>
        prevAddresses.map((addr) => ({
          ...addr,
          is_default: addr.id === id,
        }))
      );

      setSnackbar({ open: true, message: "✅ Default address updated!", severity: "success" });

      fetchAddresses();
    } catch (error) {
      setSnackbar({ open: true, message: "❌ Failed to update default address.", severity: "error" });
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h5" sx={{ color: isDarkMode ? "#F5B800" : "#6A4C93", fontWeight: "bold", mb: 3 }}>
        Saved Addresses
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{
          bgcolor: "#F5B800",
          color: "#1B1B1B",
          "&:hover": { bgcolor: "#D9A200" }
        }}
        onClick={() => { setOpen(true); setEditMode(false); setCurrentAddress(null); }}
      >
        Add New Address
      </Button>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto", mt: 3 }} />}

      <Grid container spacing={3} mt={2}>
        {addresses.map((address) => (
          <Grid item xs={12} sm={6} key={address.id}>
            <Card
              sx={{
                border: selectedAddress === address.id ? "2px solid #F5B800" : "1px solid #ccc",
                bgcolor: selectedAddress === address.id ? (isDarkMode ? "#333333" : "#F5F5F5") : (isDarkMode ? "#292929" : "#FFFFFF"),
                height: "190px",
                position: "relative",
                color: isDarkMode ? "#FFFFFF" : "#1B1B1B",
                cursor: "pointer",
              }}
              onClick={() => handleSetDefault(address.id)} // ✅ Click entire card to set default
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ color: "#6A4C93" }} />
                  <Typography variant="subtitle1" ml={1} fontWeight="bold">
                    {address.full_name}
                  </Typography>
                </Box>
                <Typography variant="body2">{address.contact_number}</Typography>
                <Typography variant="body2">{address.address_line}</Typography>
                <Typography variant="body2">{`${address.city}, ${address.state} - ${address.pincode}`}</Typography>

                {address.is_default && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: 5,
                      right: 10,
                      bgcolor: "#F5B800",
                      color: "#1B1B1B",
                      px: 1,
                      py: 0.5,
                      fontWeight: "bold",
                      borderRadius: "5px",
                    }}
                  >
                    Default Address
                  </Typography>
                )}

                {/* ✏ Edit Address */}
                <IconButton
                  sx={{ position: "absolute", top: 10, right: 45, color: "#6A4C93" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(address.id);
                  }}
                >
                  <Edit />
                </IconButton>

                {/* ❌ Delete Address */}
                <IconButton
                  sx={{ position: "absolute", top: 10, right: 10, color: "#FF4C4C" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address.id);
                  }}
                >
                  <Delete />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: "#6A4C93", color: "#FFFFFF" }}>
          {editMode ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent>
          <AddressForm onSubmit={handleAddOrEditAddress} onCancel={() => setOpen(false)} initialData={currentAddress} />
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddressesPage;
