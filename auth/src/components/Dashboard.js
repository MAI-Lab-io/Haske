import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis as BarXAxis, YAxis as BarYAxis, CartesianGrid as BarGrid, Tooltip as BarTooltip, Legend as BarLegend } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, admins: 0, images: 0, institutions: 0 });
  const [dicomStats, setDicomStats] = useState({ modalities: {}, studyDescriptions: {} });

  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
    
    fetch("https://haske.online:8080/api/dicom-stats")
      .then((res) => res.json())
      .then((data) => setDicomStats(data));
  }, []);

  const pieData = [
    { name: "Users", value: stats.users },
    { name: "Admins", value: stats.admins },
    { name: "Institutions", value: stats.institutions },
  ];

  const modalityData = Object.keys(dicomStats.modalities).map((key) => ({ name: key, value: dicomStats.modalities[key] }));
  const studyDescriptionData = Object.keys(dicomStats.studyDescriptions).map((key) => ({ name: key, value: dicomStats.studyDescriptions[key] }));
  
  const COLORS = ["#0088FE", "#FFBB28", "#FF8042", "#00C49F", "#FF6384", "#36A2EB"];

  return (
    <Box>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>Admin Dashboard</Typography>

      <Grid container spacing={3}>
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

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Modality Distribution</Typography>
            <PieChart width={300} height={300}>
              <Pie data={modalityData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                {modalityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
            </PieChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Study Descriptions</Typography>
            <PieChart width={300} height={300}>
              <Pie data={studyDescriptionData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                {studyDescriptionData.map((entry, index) => (
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
