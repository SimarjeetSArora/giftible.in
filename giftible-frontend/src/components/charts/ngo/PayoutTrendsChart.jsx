import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, Typography, Box } from "@mui/material";

const PayoutTrendsChart = ({ data }) => (
  <Card sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: 3, p: 2 }}>
    <CardContent>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontWeight: "bold", color: "#6A4C93", textAlign: "center", mb: 2 }}
      >
        Payout Trends
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6A4C93" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6A4C93" stopOpacity={0.2}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#A8A8A8" />
            <XAxis dataKey="month" tick={{ fill: "#1B1B1B", fontWeight: "bold" }} />
            <YAxis tick={{ fill: "#1B1B1B", fontWeight: "bold" }} />
            <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #6A4C93" }} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "14px", color: "#1B1B1B" }} />

            <Area 
              type="monotone" 
              dataKey="payout" 
              stroke="#6A4C93" 
              fill="url(#colorPayout)" 
              strokeWidth={3} 
              dot={{ fill: "#6A4C93", r: 4 }} 
              name="Payout Amount"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

export default PayoutTrendsChart;
