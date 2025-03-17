import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, Typography, Box } from "@mui/material";

const RevenueGrowthChart = ({ data }) => (
  <Card sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: 4, p: 3 }}>
    <CardContent>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center", mb: 2 }}
      >
        Revenue Growth
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5B800" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F5B800" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#A8A8A8" opacity={0.5} />
            <XAxis dataKey="month" tick={{ fill: "#1B1B1B", fontSize: 14, fontWeight: "bold" }} />
            <YAxis tick={{ fill: "#1B1B1B", fontSize: 14, fontWeight: "bold" }} />
            <Tooltip 
              cursor={{ stroke: "#F5B800", strokeWidth: 2, fill: "rgba(245, 184, 0, 0.1)" }}
              contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #F5B800" }}
            />
            <Legend verticalAlign="top" align="right" iconSize={16} />

            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="url(#revenueGradient)" 
              strokeWidth={3} 
              dot={{ fill: "#F5B800", r: 6, stroke: "#FFFFFF", strokeWidth: 2 }}
              activeDot={{ fill: "#F5B800", stroke: "#6A4C93", strokeWidth: 3, r: 8 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

export default RevenueGrowthChart;
