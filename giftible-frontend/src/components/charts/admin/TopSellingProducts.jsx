import React from "react";
import { Paper, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const TopSellingProducts = ({ data }) => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color: "#6A4C93", // Royal Purple
          textAlign: "center",
        }}
      >
        Top Selling Products
      </Typography>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" barSize={30}>  {/* ✅ Bar Size 20 */}
          {/* Light Grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />

          {/* X-Axis (Sales Count) */}
          <XAxis 
            type="number"
            tick={{ fill: "#6A4C93", fontWeight: "bold" }} 
            tickLine={false}
          />

          {/* Y-Axis (Product Names) */}
          <YAxis 
            dataKey="name"
            type="category"
            tick={{ fill: "#6A4C93", fontWeight: "bold" }} 
            tickLine={false}
            width={150} // ✅ Adjust width for better spacing
          />

          {/* Tooltip */}
          <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 8, borderColor: "#6A4C93" }} />

          {/* Legend */}
          <Legend verticalAlign="top" align="right" wrapperStyle={{ color: "#6A4C93", fontWeight: "bold" }} />

          {/* Solid Golden Yellow Bars */}
          <Bar 
            dataKey="sales" 
            fill="#F5B800"  // ✅ Solid Golden Yellow
            radius={[0, 4, 4, 0]}  // ✅ Rounded edges for smooth look
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TopSellingProducts;
