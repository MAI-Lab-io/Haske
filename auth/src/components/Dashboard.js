import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis as BarXAxis, YAxis as BarYAxis, CartesianGrid as BarGrid, Tooltip as BarTooltip, Legend as BarLegend } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, admins: 0, images: 0, institutions: 0 });
  const [userGrowth, setUserGrowth] = useState([]);
  const [imageStats, setImageStats] = useState([]);
  
  // Fetching the stats from the backend
  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));

    // Mock data for user growth over time
    setUserGrowth([
      { name: "Jan", users: 400 },
      { name: "Feb", users: 450 },
      { name: "Mar", users: 470 },
      { name: "Apr", users: 490 },
      { name: "May", users: 530 },
      { name: "Jun", users: 570 },
    ]);

    // Mock data for images per institution
    setImageStats([
      { institution: "National Library of Medicine", images: 1 },
      { institution: "CRESTVIEW RADIOLOGY LTD", images: 4 },
      { institution: "BTHDC LASUTH", images: 3 },
      { institution: "GEM DIAGNOSTIC CENTER", images: 3 },
    ]);
  }, []);

  // Pie chart data for users, admins, and institutions
  const pieData = [
    { name: "Users", value: stats.users },
    { name: "Admins", value: stats.admins },
    { name: "Institutions", value: stats.institutions },
  ];
  const COLORS = ["#0088FE", "#FFBB28", "#FF8042"];

  return (
    <Box>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>Admin Dashboard</Typography>

      {/* Grid Layout */}
      <Grid container spacing={3}>
        
        {/* Pie Chart Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">User Statistics</Typography>
            <PieChart width={300} height={300}>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
            </PieChart>
          </Paper>
        </Grid>

        {/* Line Chart Section: User Growth Over Time */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>User Growth Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                <LineTooltip />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bar Chart Section: Images per Institution */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>Images per Institution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={imageStats}>
                <Bar dataKey="images" fill="#8884d8" />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="institution" />
                <YAxis />
                <BarTooltip />
                <BarLegend />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;
