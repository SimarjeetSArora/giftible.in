import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d45087", "#4e79a7"];

const TopProductsChart = ({ data }) => {
  const theme = useTheme();

  return (
    <Card sx={{ background: theme.palette.background.paper, boxShadow: 2, borderRadius: "12px", p: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Top Selling Products
        </Typography>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={268}>
            <PieChart>
              <Pie
                data={data}
                dataKey="total_sold"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill={theme.palette.secondary.main}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
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

export default TopProductsChart;
