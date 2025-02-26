import {
    TextField, InputAdornment, IconButton, Slider, Box,
    Button, Typography, FormControlLabel, Checkbox, Dialog,
    DialogTitle, DialogContent, DialogActions,
  } from "@mui/material";
  import { Visibility, VisibilityOff, Search, UploadFile } from "@mui/icons-material";
  import React, { useState } from "react";
  import axiosInstance from "../services/axiosInstance";
  


  const handlePincodeLookup = async (formData, setFormData, setSnackbar) => {
    if (!formData.pincode || formData.pincode.length !== 6) {
      return setSnackbar({
        open: true,
        message: "⚠️ Enter a valid 6-digit pincode.",
        severity: "warning",
      });
    }
  
    try {
      const { data } = await axiosInstance.get(`https://api.postalpincode.in/pincode/${formData.pincode}`);
      const location = data[0]?.PostOffice?.[0];
  
      if (location) {
        setFormData((prev) => ({
          ...prev,
          city: location.District,
          state: location.State,
        }));
        setSnackbar({ open: true, message: "✅ City and state retrieved!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: "❌ Invalid pincode.", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "❌ Failed to fetch location.", severity: "error" });
    }
  };
  
  

  const StepContent = React.memo(({
    activeStep, formData, setFormData, handleChange, passwordStrength, showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword, setSnackbar, licenseName, setLicenseName,
    logoName, setLogoName, termsAccepted, setTermsAccepted, privacyAccepted, setPrivacyAccepted,
    openTermsModal, setOpenTermsModal, openPrivacyModal, setOpenPrivacyModal, colors
  }) => {
  
    return (
      <>
        {activeStep === 0 && (
          <>
            <TextField name="ngo_name" label="NGO Name" fullWidth margin="normal" value={formData.ngo_name} onChange={handleChange} required />
            <TextField name="first_name" label="First Name" fullWidth margin="normal" value={formData.first_name} onChange={handleChange} required />
            <TextField name="last_name" label="Last Name" fullWidth margin="normal" value={formData.last_name} onChange={handleChange} required />
            <TextField name="email" label="Email" type="email" fullWidth margin="normal" value={formData.email} onChange={handleChange} required />
            <TextField name="contact_number" label="Contact Number" fullWidth margin="normal" value={formData.contact_number} onChange={handleChange} required />
          </>
        )}
  
        {activeStep === 1 && (
          <>
            <TextField name="account_holder_name" label="Account Holder Name" fullWidth margin="normal" value={formData.account_holder_name} onChange={handleChange} required />
            <TextField name="account_number" label="Account Number" type="password" fullWidth margin="normal" value={formData.account_number} onChange={handleChange} required />
            <TextField name="confirm_account_number" label="Confirm Account Number" fullWidth margin="normal" value={formData.confirm_account_number} onChange={handleChange} required />
            <TextField
              name="ifsc_code"
              label="IFSC Code"
              fullWidth
              margin="normal"
              value={formData.ifsc_code}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={async () => {
                      try {
                        const { data } = await axiosInstance.get(`https://ifsc.razorpay.com/${formData.ifsc_code}`);
                        setSnackbar({ open: true, message: "✅ Bank details retrieved!", severity: "success" });
                        handleChange({ target: { name: "bank_name", value: data.BANK } });
                        handleChange({ target: { name: "branch", value: data.BRANCH } });
                      } catch {
                        setSnackbar({ open: true, message: "❌ Invalid IFSC code.", severity: "error" });
                      }
                    }}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
           <TextField name="bank_name" label="Bank Name" fullWidth margin="normal" value={formData.bank_name} disabled />
<TextField name="branch" label="Branch" fullWidth margin="normal" value={formData.branch} disabled />

          </>
        )}
  
        {activeStep === 2 && (
          <>
            <TextField name="address" label="Address" fullWidth margin="normal" value={formData.address} onChange={handleChange} required />
            <TextField
  name="pincode"
  label="Pincode"
  fullWidth
  margin="normal"
  value={formData.pincode}
  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
  required
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        
        <IconButton onClick={() => handlePincodeLookup(formData, setFormData, setSnackbar)}>
  <Search />
</IconButton>


      </InputAdornment>
    ),
  }}
/>

<TextField
  name="city"
  label="City"
  fullWidth
  margin="normal"
  value={formData.city}
  disabled
/>

<TextField
  name="state"
  label="State"
  fullWidth
  margin="normal"
  value={formData.state}
  disabled
/>
          </>
        )}
  
  {activeStep === 3 && (
  <>
    
    

    {/* Password Field */}
    <TextField
  name="password"
  label="Password"
  type={showPassword ? "password" : "password"}
  fullWidth
  margin="normal"
  value={formData.password}
  onChange={handleChange}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
      </InputAdornment>
    ),
  }}
/>

    {/* Confirm Password Field */}
    <TextField
  name="confirm_password"
  label="Confirm Password"
  type={showConfirmPassword ? "text" : "password"}
  fullWidth
  margin="normal"
  value={formData.confirm_password}
  onChange={handleChange}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          edge="end"
        >
          {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>


    {/* Upload NGO License */}
    <Box mt={3} display="flex" flexDirection="column" alignItems="flex-start">
      <Button
        component="label"
        variant="contained"
        startIcon={<UploadFile />}
        sx={{
          bgcolor: colors.accent,
          py: 1,
          px: 3,
          borderRadius: "12px",
          "&:hover": { bgcolor: "#E0A700" },
        }}
      >
        Upload NGO License
        <input
          type="file"
          name="license"
          accept=".pdf,.jpg,.png"
          hidden
          onChange={handleChange}
          required
        />
      </Button>
      <Typography variant="body2" sx={{ mt: 1, color: colors.textPrimary }}>
        {licenseName !== "No file chosen" ? `📄 ${licenseName}` : "No file chosen"}
      </Typography>
    </Box>

    {/* Upload NGO Logo */}
    <Box mt={3} display="flex" flexDirection="column" alignItems="flex-start">
      <Button
        component="label"
        variant="contained"
        startIcon={<UploadFile />}
        sx={{
          bgcolor: colors.accent,
          py: 1,
          px: 3,
          borderRadius: "12px",
          "&:hover": { bgcolor: "#E0A700" },
        }}
      >
        Upload NGO Logo
        <input
          type="file"
          name="logo"
          accept="image/*"
          hidden
          onChange={handleChange}
          required
        />
      </Button>
      <Typography variant="body2" sx={{ mt: 1, color: colors.textPrimary }}>
        {logoName !== "No file chosen" ? `🖼️ ${logoName}` : "No file chosen"}
      </Typography>
    </Box>

    {/* Terms & Conditions Checkbox */}
    <FormControlLabel
  control={
    <Checkbox
      checked={termsAccepted}
      onChange={() => setTermsAccepted(!termsAccepted)}
      sx={{ color: colors.accent }}
    />
  }
  label={
    <Typography component="span" sx={{ color: colors.textPrimary }}>
      I accept the{" "}
      <span
        style={{
          color: colors.accent,
          cursor: "pointer",
          textDecoration: "underline",
          fontWeight: "bold",
        }}
        onClick={() => setOpenTermsModal(true)}
      >
        Terms & Conditions
      </span>
    </Typography>
  }
/>




    {/* Privacy Policy Checkbox */}
    <FormControlLabel
  control={
    <Checkbox
      checked={privacyAccepted}
      onChange={() => setPrivacyAccepted(!privacyAccepted)}
      sx={{ color: colors.accent }}
    />
  }
  label={
    <Typography component="span" sx={{ color: colors.textPrimary }}>
      I accept the{" "}
      <Typography
        component="span"
        sx={{
          color: colors.accent,
          cursor: "pointer",
          textDecoration: "underline",
          fontWeight: "bold",
        }}
        onClick={() => setOpenPrivacyModal(true)}
      >
        Privacy Policy
      </Typography>
    </Typography>
  }
/>


    {/* Terms & Conditions Modal */}
    <Dialog open={openTermsModal} onClose={() => setOpenTermsModal(false)} maxWidth="sm" fullWidth>
      <DialogTitle>📜 Terms & Conditions</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">
          By using this platform, you agree to our terms and conditions, ensuring fair usage and compliance with platform policies.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenTermsModal(false)} variant="contained" sx={{ bgcolor: colors.accent }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Privacy Policy Modal */}
    <Dialog open={openPrivacyModal} onClose={() => setOpenPrivacyModal(false)} maxWidth="sm" fullWidth>
      <DialogTitle>🔒 Privacy Policy</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">
          We value your privacy and ensure your data is secure. Your information will not be shared without consent.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenPrivacyModal(false)} variant="contained" sx={{ bgcolor: colors.accent }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>
)}

      </>
    );
  });
  
  export default StepContent;
  