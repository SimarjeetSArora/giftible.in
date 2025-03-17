import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SalesTrendsChart = ({ data }) => {
  const theme = useTheme();

  return (
    <Card sx={{ background: theme.palette.background.paper, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Sales Trends
        </Typography>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={(month) => monthNames[month - 1]} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke={theme.palette.success.main} strokeWidth={2} />
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

export default SalesTrendsChart;
