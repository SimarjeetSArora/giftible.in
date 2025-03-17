import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const TopNgosChart = ({ data }) => {
  const theme = useTheme();

  return (
    <Card sx={{ background: theme.palette.background.paper, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Top NGOs
        </Typography>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: theme.palette.text.primary }} />
              <YAxis
                dataKey="ngo_name"
                type="category"
                tick={{ fill: theme.palette.text.primary }}
                width={120}
              />
              <Tooltip />
              <Bar dataKey="total_sales" fill={theme.palette.secondary.main} barSize={30} />
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

export default TopNgosChart;
