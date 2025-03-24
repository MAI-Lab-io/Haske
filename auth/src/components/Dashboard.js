import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, admins: 0, images: 0, institutions: 0 });
  const [modalityStats, setModalityStats] = useState([]);
  const [studyDescriptionStats, setStudyDescriptionStats] = useState([]);

  useEffect(() => {
    fetch("https://haske.online:8090/api/verification/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Error fetching verification stats:", error));

    fetch("https://haske.online:8090/api/dicom-stats")
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

  // Updated color palette with a shade of #0F172A
  const COLORS = ["#0F172A", "#1E2A4A", "#E5E7EB", "#dd841a"];

  return (
    <Box>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>Admin Dashboard</Typography>

      <Grid container spacing={3}>
        {/* User Statistics Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">User Statistics</Typography>
            <PieChart width={300} height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#0F172A" // Default fill color
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
            </PieChart>
          </Paper>
        </Grid>

        {/* Modality Distribution Bar Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Modality Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modalityStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1E2A4A" /> {/* Updated fill color */}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Body Part Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Body Part</Typography>
            <PieChart width={300} height={300}>
              <Pie
                data={studyDescriptionStats}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#E5E7EB" // Default fill color
                dataKey="count"
              >
                {studyDescriptionStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
