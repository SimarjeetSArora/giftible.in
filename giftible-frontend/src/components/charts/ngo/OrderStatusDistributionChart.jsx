import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, Typography, Box } from "@mui/material";

// 🎨 Define brand colors for each order status
const STATUS_COLORS = {
  Processing: "#F5B800",  // Golden Yellow
  Delivered: "#4CAF50",   // Success Green
  Cancelled: "#D32F2F",   // Error Red
  Pending: "#6A4C93",     // Royal Purple
  Shipped: "#1976D2"      // Deep Blue
};

const OrderStatusDistributionChart = ({ data }) => (
  <Card sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: 3, p: 2 }}>
    <CardContent>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center", mb: 2 }}
      >
        Order Status Distribution
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie 
              data={data} 
              dataKey="count" 
              nameKey="status" 
              cx="50%" 
              cy="50%" 
              outerRadius={110} 
              innerRadius={60} 
              paddingAngle={3} 
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={STATUS_COLORS[entry.status] || "#8884d8"} />
              ))}
            </Pie>
            <Tooltip cursor={{ fill: "rgba(245, 184, 0, 0.1)" }} />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle"
              wrapperStyle={{ fontSize: "14px", color: "#1B1B1B" }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

export default OrderStatusDistributionChart;
