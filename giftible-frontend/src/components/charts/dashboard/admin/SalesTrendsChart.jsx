import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const SalesTrendsChart = ({ data }) => {
  const theme = useTheme();

  // ✅ Convert Month Numbers to Names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ✅ Format Data for Chart (Convert Month Numbers to Month Names)
  const formattedData = data.map(item => ({
    month: monthNames[item.month - 1],  // Convert month number to name
    sales: item.sales,
  }));

  return (
    <Card sx={{ background: theme.palette.background.paper, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Sales Trends
        </Typography>
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <XAxis dataKey="month" tick={{ fill: theme.palette.text.primary }} />
              <YAxis tick={{ fill: theme.palette.text.primary }} />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="sales" stroke={theme.palette.primary.main} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No sales data available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesTrendsChart;
