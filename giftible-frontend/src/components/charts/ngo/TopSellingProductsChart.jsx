import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";

const TopSellingProductsChart = ({ data }) => (
  <Card sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: 3 }}>
    <CardContent>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center", mb: 2 }}
      >
        Top Selling Products
      </Typography>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5B800" opacity={0.5} />
          <XAxis dataKey="name" tick={{ fill: "#1B1B1B", fontSize: 14, fontWeight: "bold" }} />
          <YAxis tick={{ fill: "#1B1B1B", fontSize: 14 }} />
          <Tooltip cursor={{ fill: "rgba(245, 184, 0, 0.2)" }} />
          <Legend verticalAlign="top" align="right" iconSize={16} />
          
          <Bar dataKey="sales" fill="#6A4C93" name="Total Sales" radius={[8, 8, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default TopSellingProductsChart;
