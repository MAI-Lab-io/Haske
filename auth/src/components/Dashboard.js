import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material"; // Import useTheme
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, admins: 0, images: 0, institutions: 0 });
  const [modalityStats, setModalityStats] = useState([]);
  const [studyDescriptionStats, setStudyDescriptionStats] = useState([]);
  const theme = useTheme(); // Get the current theme

  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Error fetching verification stats:", error));

    fetch("https://haske.online:8080/api/dicom-stats")
      .then((res) => res.json())
      .then((data) => {
        setModalityStats(
          Object.entries(data.modalities).map(([key, value]) => ({
            name: key,
            count: value,
          }))
        );
        setStudyDescriptionStats(
          Object.entries(data.studyDescriptions).map(([key, value]) => ({
            name: key,
            count: value,
          }))
        );
      })
      .catch((error) => console.error("Error fetching DICOM stats:", error));
  }, []);

  const pieData = [
    { name: "Users", value: stats.users },
    { name: "Admins", value: stats.admins },
    { name: "Institutions", value: stats.institutions },
  ];

  // Use theme colors for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>Admin Dashboard</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              User Statistics
            </Typography>
            <PieChart width={300} height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={theme.palette.primary.main}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              Modality Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modalityStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="name" stroke={theme.palette.text.primary} />
                <YAxis stroke={theme.palette.text.primary} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              Study Descriptions
            </Typography>
            <PieChart width={300} height={300}>
              <Pie
                data={studyDescriptionStats}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={theme.palette.secondary.main}
                dataKey="count"
              >
                {studyDescriptionStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
