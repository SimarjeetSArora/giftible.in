import React from "react";
import { Paper, Typography } from "@mui/material";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";

const PayoutChart = ({ data }) => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color: "#6A4C93", // ✅ Royal Purple Title
        }}
      >
        Payout Trends
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#A8A8A8" /> {/* ✅ Subtle Grid */}
          
          <XAxis 
            dataKey="month"
            stroke="#6A4C93"
            tick={{ fill: "#1B1B1B", fontSize: 12, fontWeight: "bold" }} 
          />
          <YAxis 
            stroke="#6A4C93"
            tick={{ fill: "#1B1B1B", fontSize: 12, fontWeight: "bold" }}
          />

          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 8, borderColor: "#FF5733" }}
            labelStyle={{ fontWeight: "bold", color: "#FF5733" }}
          />

          <Legend wrapperStyle={{ color: "#6A4C93", fontWeight: "bold" }} />

          {/* ✅ Line with Smooth Curves & Point Markers */}
          <Line 
            type="monotone" 
            dataKey="payout" 
            stroke="#FF5733"  // ✅ Unique payout color
            strokeWidth={3} 
            dot={{ fill: "#6A4C93", r: 5 }} 
            activeDot={{ fill: "#F5B800", strokeWidth: 2, r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default PayoutChart;
