import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// ✅ Month Name Formatter
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const OrderTrendsChart = ({ data }) => {
  const theme = useTheme();

  return (
    <Card sx={{ background: theme.palette.background.paper, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Order Trends
        </Typography>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(month) => monthNames[month - 1]} 
                tick={{ fill: theme.palette.text.primary }} 
              />
              <YAxis tick={{ fill: theme.palette.text.primary }} />
              <Tooltip />
              <Legend />
              {/* ✅ Total Orders */}
              <Bar dataKey="total_orders" name="Total Orders" fill={theme.palette.primary.main} barSize={40} />
              {/* ✅ Cancelled Orders */}
              <Bar dataKey="cancelled_orders" name="Cancelled Orders" fill={theme.palette.error.main} barSize={40} />
            </BarChart>
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

export default OrderTrendsChart;
