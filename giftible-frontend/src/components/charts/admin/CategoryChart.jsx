import React from "react";
import { Paper, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CategoryChart = ({ data }) => {
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
        Category Distribution
      </Typography>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={40}>  {/* ⬅️ Reduced Bar Size */}
          {/* Grid with soft stroke */}
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />

          {/* X-Axis - Category Names */}
          <XAxis 
            dataKey="category_name"
            tick={{ fill: "#6A4C93", fontWeight: "bold" }} 
            tickLine={false}
          />

          {/* Y-Axis - Product Count */}
          <YAxis 
            tick={{ fill: "#6A4C93", fontWeight: "bold" }} 
            tickLine={false}
            axisLine={{ stroke: "#6A4C93" }}
          />

          {/* Tooltip for better UX */}
          <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 8, borderColor: "#6A4C93" }} />

          {/* Legend for clarity */}
          <Legend verticalAlign="top" align="right" wrapperStyle={{ color: "#6A4C93", fontWeight: "bold" }} />

          {/* Solid Golden Yellow Bars */}
          <Bar 
            dataKey="product_count" 
            fill="#F5B800"  // ⬅️ Solid Golden Yellow 
            radius={[6, 6, 0, 0]} // Slightly rounded
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default CategoryChart;
