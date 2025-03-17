import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// 🔹 Function to Convert Month Number to Month Name
const getMonthName = (monthNumber) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[monthNumber - 1] || "Unknown";
};

const PayoutTrendsChart = ({ data }) => {
  const theme = useTheme();

  return (
    <Card sx={{ background: theme.palette.background.paper, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Payout Trends
        </Typography>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(month) => getMonthName(month)}
                tick={{ fill: theme.palette.text.primary }}
              />
              <YAxis tick={{ fill: theme.palette.text.primary }} />
              <Tooltip formatter={(value, name, props) => [`₹${value.toLocaleString()}`, "Payout Amount"]} />
              <Line type="monotone" dataKey="payouts" stroke={theme.palette.warning.main} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No data available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutTrendsChart;
