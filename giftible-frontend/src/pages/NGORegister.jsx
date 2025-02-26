import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Snackbar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import StepContent from "./StepContent";
import API_BASE_URL from "../config";
import { useThemeContext } from "../context/ThemeContext";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";


function NGORegister() {
  const { mode } = useThemeContext();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(0); // Controls animation direction
  const steps = ["Basic Details", "Bank Details", "Address", "Documents"];
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openTermsModal, setOpenTermsModal] = useState(false);
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [licenseName, setLicenseName] = useState("No file chosen");
  const [logoName, setLogoName] = useState("No file chosen");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);  // ✅ Add this if missing





  const [formData, setFormData] = useState({
    ngo_name: "",
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    password: "",
    confirm_password: "",
    account_holder_name: "",
    account_number: "",
    confirm_account_number: "",
    ifsc_code: "",
    bank_name: "",
    branch: "",
    address: "",
    pincode:"",
    city: "",
    state: "",
    license: null,
    logo: null,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  const colors = {
    textPrimary: mode === "dark" ? "#FFFFFF" : "#1B1B1B",
    cardBg: mode === "dark" ? "#292929" : "#FFFFFF",
    accent: "#F5B800",
  };

  // ✅ Handles input changes and preserves existing form data
  const handleChange = (e) => {
    const { name, value, files } = e.target;
  
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
  
      if (name === "license") setLicenseName(files[0].name);
      if (name === "logo") setLogoName(files[0].name);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  

  const handleNext = () => {
    setDirection(1); // Forward animation
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1); // Backward animation
    setActiveStep((prev) => prev - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
  
      await axiosInstance.post(`${API_BASE_URL}/register/ngo`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // ✅ Show snackbar and navigate after a short delay
      setSnackbar({
        open: true,
        message: "✅ NGO registered successfully, awaiting admin approval.",
        severity: "success",
      });
  
      setTimeout(() => {
        navigate("/");  // Redirects to homepage
      }, 2500); // 2.5-second delay for the user to read the message
  
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "❌ Registration failed.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ Animation variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      position: "absolute",
    }),
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={6} sx={{ p: { xs: 3, md: 6 }, borderRadius: "20px", bgcolor: colors.cardBg }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" sx={{ color: colors.textPrimary, mb: 4 }}>
          NGO Registration
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* ✅ Animated Step Content */}
        <Box
          mt={4}
          sx={{
            position: "relative",
            minHeight: "420px", // Prevents layout shifting during animations
            overflow: "hidden",
          }}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.section
              key={activeStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ width: "100%", height: "100%" }}
            >
              <StepContent
                activeStep={activeStep}
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                setSnackbar={setSnackbar}
                colors={colors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                openTermsModal={openTermsModal}
                setOpenTermsModal={setOpenTermsModal}
                openPrivacyModal={openPrivacyModal}
                setOpenPrivacyModal={setOpenPrivacyModal}
                licenseName={licenseName}
                setLicenseName={setLicenseName}
                logoName={logoName}
                setLogoName={setLogoName}privacyAccepted={privacyAccepted}
                setPrivacyAccepted={setPrivacyAccepted}
                termsAccepted={termsAccepted}
                setTermsAccepted={setTermsAccepted}
              
                
              />
            </motion.section>
          </AnimatePresence>
        </Box>

        {/* ✅ Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: colors.accent }}
              onClick={handleRegister}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} sx={{ bgcolor: colors.accent }}>
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* ✅ Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Container>
  );
}

export default NGORegister;
