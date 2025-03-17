import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { CheckCircle, ErrorOutline, MailOutline } from "@mui/icons-material";
import { Card, CardContent, Typography, Box, CircularProgress } from "@mui/material";
import API_BASE_URL from "../config";

const VerifyMail = () => {
    const { user_id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Verifying your email...");
    const [status, setStatus] = useState("loading"); // ✅ loading | success | error
    const [countdown, setCountdown] = useState(3); // ✅ Redirect timer

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axiosInstance.get(`${API_BASE_URL}/verify-email/${user_id}`);
                setMessage(response.data.message);
                setStatus("success");

                // ✅ Countdown for redirecting
                const interval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev === 1) {
                            clearInterval(interval);
                            navigate("/login"); // ✅ Redirect to login
                        }
                        return prev - 1;
                    });
                }, 1000);
            } catch (error) {
                setMessage(error.response?.data?.detail || "Failed to verify email.");
                setStatus("error");
            }
        };

        verifyEmail();
    }, [user_id, navigate]);

    return (
        <Box 
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50vh",
                bgcolor: "background.default", // ✅ Light/Dark mode support
            }}
        >
            <Card 
                sx={{
                    p: 4,
                    width: "100%",
                    maxWidth: 400,
                    textAlign: "center",
                    boxShadow: 3,
                    borderRadius: "12px",
                    animation: "fadeIn 0.6s ease-in-out",
                }}
            >
                <CardContent>
                    {status === "loading" && <CircularProgress sx={{ color: "primary.main", mb: 2 }} />}
                    {status === "success" && <CheckCircle sx={{ fontSize: 50, color: "green", mb: 1 }} />}
                    {status === "error" && <ErrorOutline sx={{ fontSize: 50, color: "red", mb: 1 }} />}
                    {status === "loading" && <MailOutline sx={{ fontSize: 50, color: "primary.main", mb: 1 }} />}

                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {message}
                    </Typography>
                    
                    {status === "success" && (
                        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                            Redirecting to login in {countdown} seconds...
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default VerifyMail;
