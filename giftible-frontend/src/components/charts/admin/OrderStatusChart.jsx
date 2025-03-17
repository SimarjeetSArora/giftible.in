import React from "react";
import { Paper, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#F5B800", "#6A4C93", "#33A1FF", "#FF5733"]; // 🔥 Custom colors

const OrderStatusChart = ({ data }) => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color: "#6A4C93", // ✅ Royal Purple
        }}
      >
        Order Status Distribution
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          {/* ✅ Donut Chart with Inner Radius */}
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={50}  // ✅ Inner Radius for Donut Effect
            outerRadius={100}
            paddingAngle={4} // ✅ Small padding for spacing
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} // ✅ Display % in labels
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}  // ✅ Cycle through custom colors
                style={{ transition: "transform 0.3s ease-in-out" }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              />
            ))}
          </Pie>

          {/* ✅ Tooltip & Legend */}
          <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 8, borderColor: "#6A4C93" }} />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ color: "#6A4C93", fontWeight: "bold" }} />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default OrderStatusChart;
