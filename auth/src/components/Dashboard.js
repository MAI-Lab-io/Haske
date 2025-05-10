import React, { useEffect, useState } from "react";
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from "@mui/material";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";

const COLORS = ["#0F172A", "#1E2A4A", "#E5E7EB", "#dd841a", "#64748B", "#94A3B8"];

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    users: 0, 
    admins: 0, 
    institutions: 0 
  });
  const [dicomStats, setDicomStats] = useState({
    modalities: [],
    studyDescriptions: [],
    bodyParts: [],
    institutions: [],
    totalStudies: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user stats
        const statsResponse = await fetch("https://haske.online:8090/api/verification/stats");
        if (!statsResponse.ok) throw new Error("Failed to fetch user stats");
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch DICOM stats
        const dicomResponse = await fetch("https://haske.online:8090/api/dicom-stats");
        if (!dicomResponse.ok) throw new Error("Failed to fetch DICOM stats");
        const dicomData = await dicomResponse.json();
        setDicomStats(dicomData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading dashboard data: {error}
      </Alert>
    );
  }

  // Prepare chart data
  const userData = [
    { name: "Users", value: stats.users },
    { name: "Admins", value: stats.admins },
    { name: "Institutions", value: stats.institutions },
  ];

  // Sort and limit to top 10 for better visualization
  const topModalities = [...dicomStats.modalities]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topBodyParts = [...dicomStats.bodyParts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topStudyDescriptions = [...dicomStats.studyDescriptions]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Admin Dashboard</Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats.users}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Admins</Typography>
              <Typography variant="h4">{stats.admins}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Institutions</Typography>
              <Typography variant="h4">{stats.institutions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Studies</Typography>
              <Typography variant="h4">{dicomStats.totalStudies}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* User Statistics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>User Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Modality Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Top Modalities</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topModalities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1E2A4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Body Parts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Top Body Parts</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topBodyParts}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {topBodyParts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Additional Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Study Descriptions</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topStudyDescriptions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#dd841a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Institutions</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dicomStats.institutions.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
