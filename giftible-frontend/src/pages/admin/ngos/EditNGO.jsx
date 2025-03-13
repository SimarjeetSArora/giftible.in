import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { fetchNGODetails, updateNGO } from "../../../services/adminService";
import API_BASE_URL from "../../../config";

const EditNGO = () => {
  const { ngoId } = useParams();
  const navigate = useNavigate();

  const [ngoData, setNgoData] = useState({
    ngo_name: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [existingLogo, setExistingLogo] = useState("");
  const [existingLicense, setExistingLicense] = useState("");

  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    const getNGO = async () => {
      try {
        const data = await fetchNGODetails(ngoId);
        setNgoData({
          ngo_name: data.ngo_name,
          account_holder_name: data.account_holder_name,
          account_number: data.account_number,
          ifsc_code: data.ifsc_code,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          contact_number: data.contact_number,
        });

        setExistingLogo(data.logo ? `${API_BASE_URL}${data.logo}` : "");
        setExistingLicense(data.license ? `${API_BASE_URL}${data.license}` : "");
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load NGO details.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    getNGO();
  }, [ngoId]);

  const handleChange = (event) => {
    setNgoData({ ...ngoData, [event.target.name]: event.target.value });
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedLogoFormats = ["image/png", "image/jpeg"];
    const allowedLicenseFormats = ["image/png", "image/jpeg", "application/pdf"];

    if (type === "logo" && !allowedLogoFormats.includes(file.type)) {
      setSnackbar({
        open: true,
        message: "Invalid logo format. Only JPG, PNG allowed.",
        severity: "error",
      });
      return;
    }

    if (type === "license" && !allowedLicenseFormats.includes(file.type)) {
      setSnackbar({
        open: true,
        message: "Invalid license format. Only JPG, PNG, PDF allowed.",
        severity: "error",
      });
      return;
    }

    if (type === "logo") setLogoFile(file);
    if (type === "license") setLicenseFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const formData = new FormData();
    
    // ✅ Append all text fields
    Object.keys(ngoData).forEach((key) => {
      formData.append(key, String(ngoData[key]));  // ✅ Ensure all values are strings
    });
  
    // ✅ Append files if they exist
    if (logoFile) formData.append("logo", logoFile);
    if (licenseFile) formData.append("license", licenseFile);
  
    // ✅ Debugging: Log formData before sending
    for (let pair of formData.entries()) {
      console.log("🚀 FormData Key:", pair[0], "=>", pair[1]);
    }
  
    try {
      const response = await updateNGO(ngoId, formData);
      setSnackbar({
        open: true,
        message: "✅ NGO updated successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/admin/manage-ngos"), 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "❌ Update failed. Please try again.",
        severity: "error",
      });
    }
  };
  
  
  

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5">Loading NGO Details...</Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>✏️ Edit NGO</Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="NGO Name" name="ngo_name" value={ngoData.ngo_name} onChange={handleChange} required />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Account Holder Name" name="account_holder_name" value={ngoData.account_holder_name} onChange={handleChange} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Account Number" name="account_number" value={ngoData.account_number} onChange={handleChange} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="IFSC Code" name="ifsc_code" value={ngoData.ifsc_code} onChange={handleChange} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Pincode" name="pincode" value={ngoData.pincode} onChange={handleChange} required />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Address" name="address" value={ngoData.address} onChange={handleChange} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="City" name="city" value={ngoData.city} onChange={handleChange} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="State" name="state" value={ngoData.state} onChange={handleChange} required />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Admin First Name" name="first_name" value={ngoData.first_name} onChange={handleChange} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Admin Last Name" name="last_name" value={ngoData.last_name} onChange={handleChange} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Admin Email" name="email" type="email" value={ngoData.email} onChange={handleChange} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Admin Contact Number" name="contact_number" value={ngoData.contact_number} onChange={handleChange} required />
          </Grid>

          {/* ✅ Logo Upload */}
          <Grid item xs={12}>
            <Typography variant="h6">NGO Logo</Typography>
            {existingLogo && <img src={existingLogo} alt="NGO Logo" style={{ width: "150px", borderRadius: "5px", marginBottom: "10px" }} />}
            <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, "logo")} />
          </Grid>

          {/* ✅ License Upload */}
          <Grid item xs={12}>
            <Typography variant="h6">NGO License</Typography>
            {existingLicense && <a href={existingLicense} target="_blank" rel="noopener noreferrer"><Button variant="contained">View License</Button></a>}
            <input type="file" accept="image/png, image/jpeg, application/pdf" onChange={(e) => handleFileChange(e, "license")} />
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button type="submit" variant="contained" color="primary">Save Changes</Button>
          </Grid>
        </Grid>
      </form>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default EditNGO;
