import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";

// 🎨 Custom Color Palette (Giftible Color Scheme)
const COLORS = ["#6A4C93", "#F5B800", "#D32F2F", "#4CAF50", "#1976D2", "#A8A8A8"];

// 📊 Products Per Category Chart
const ProductsPerCategoryChart = ({ data }) => (
  <Card sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: 3 }}>
    <CardContent>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center", mb: 2 }}
      >
        Products Per Category
      </Typography>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            dataKey="product_count"
            nameKey="category_name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            fill="#6A4C93"
            label={({ category_name, percent }) => `${category_name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell 
                key={index} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#FFFFFF" 
                strokeWidth={2} 
                style={{ transition: "all 0.3s ease-in-out" }} 
              />
            ))}
          </Pie>
          <Tooltip cursor={{ fill: "rgba(245, 184, 0, 0.2)" }} />
          <Legend verticalAlign="bottom" iconSize={14} wrapperStyle={{ marginTop: "10px" }} />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default ProductsPerCategoryChart;
