import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, admins: 0, images: 0, institutions: 0 });

  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  const pieData = [
    { name: "Users", value: stats.users },
    { name: "Admins", value: stats.admins },
    { name: "Institutions", value: stats.institutions },
  ];
  const COLORS = ["#0088FE", "#FFBB28", "#FF8042"];

  return (
    <Box>
      <Typography variant="h4">Admin Dashboard</Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">User Statistics</Typography>
            <PieChart width={300} height={300}>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
