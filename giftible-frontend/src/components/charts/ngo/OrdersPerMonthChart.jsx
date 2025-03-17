import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, Typography, Box } from "@mui/material";

const OrdersPerMonthChart = ({ data }) => (
  <Card sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: 4, p: 3 }}>
    <CardContent>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center", mb: 2 }}
      >
        Orders Per Month
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A8A8A8" opacity={0.5} />
            <XAxis dataKey="month" tick={{ fill: "#1B1B1B", fontSize: 14, fontWeight: "bold" }} />
            <YAxis tick={{ fill: "#1B1B1B", fontSize: 14, fontWeight: "bold" }} />
            <Tooltip 
              cursor={{ fill: "rgba(245, 184, 0, 0.2)" }}
              contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #F5B800" }}
            />
            <Legend verticalAlign="top" align="right" iconSize={16} />

            <Bar 
              dataKey="total_orders" 
              fill="#6A4C93" 
              name="Total Orders" 
              radius={[10, 10, 0, 0]} 
              barSize={40} 
            />
            <Bar 
              dataKey="cancelled_orders" 
              fill="#F5B800" 
              name="Cancelled Orders" 
              radius={[10, 10, 0, 0]} 
              barSize={40} 
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

export default OrdersPerMonthChart;
