import React, { useEffect, useState } from "react";
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
  Chip,
  ToggleButton,
  ToggleButtonGroup
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

const COLORS = ["#0F172A", "#1E2A4A", "#E5E7EB", "#dd841a", "#64748B", "#94A3B8", "#334155", "#475569"];

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({ 
    users: 0, 
    admins: 0, 
    institutions: 0 
  });
  const [dicomStats, setDicomStats] = useState({
    bodyParts: [],
    studyDescriptions: [],
    modalities: [],
    institutions: [],
    modalitiesPerInstitution: [],
    totalStudies: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalities, setActiveModalities] = useState([]);
  const [timeRange, setTimeRange] = useState('all');
  const [institutionsList, setInstitutionsList] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, dicomResponse, analyticsResponse, institutionsResponse] = await Promise.all([
        fetch("https://api.haske.online/api/verification/stats"),
        fetch("https://api.haske.online/api/dicom-stats"),
        fetch(`https://api.haske.online/api/analytics/logs?timeRange=${timeRange}`),
        fetch("https://api.haske.online/api/institutions?page=1&pageSize=100") // Fetch all institutions
      ]);

      if (!statsResponse.ok) throw new Error("Failed to fetch user stats");
      if (!dicomResponse.ok) throw new Error("Failed to fetch DICOM stats");
      if (!institutionsResponse.ok) throw new Error("Failed to fetch institutions");

      const [statsData, dicomData, institutionsData] = await Promise.all([
        statsResponse.json(),
        dicomResponse.json(),
        institutionsResponse.json()
      ]);

      setStats(statsData);
      setDicomStats(dicomData);
      setInstitutionsList(institutionsData.institutions || []);
      
      // Initialize active modalities
      const uniqueModalities = [...new Set(dicomData.modalities.map(item => item.name))];
      setActiveModalities(uniqueModalities);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [timeRange]);
  
  // Transform data for stacked bar chart
  const getStackedChartData = () => {
    const institutionMap = {};
    
    // Filter by active modalities
    const filteredData = dicomStats.modalitiesPerInstitution.filter(item => 
      activeModalities.includes(item.modality)
    );

    // Group by institution
    filteredData.forEach(item => {
      if (!institutionMap[item.institution]) {
        institutionMap[item.institution] = {
          institution: item.institution,
          total: 0
        };
      }
      institutionMap[item.institution][item.modality] = item.count;
      institutionMap[item.institution].total += item.count;
    });

    // Sort by total count and take top 10
    return Object.values(institutionMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  };

  const stackedChartData = getStackedChartData();
  const uniqueModalities = [...new Set(dicomStats.modalities.map(item => item.name))];

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

  // Prepare other chart data
  const userData = [
    { name: "Users", value: stats.users },
    { name: "Admins", value: stats.admins },
    { name: "Institutions", value: stats.institutions },
  ];

  const topModalities = [...dicomStats.modalities]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topBodyParts = [...dicomStats.bodyParts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

 const topInstitutions = [...dicomStats.institutions]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

const allInstitutions = [...dicomStats.institutions]
  .sort((a, b) => b.count - a.count)
  .map(institution => {
    const fullDetails = institutionsList.find(inst => inst.id === institution.id) || {};
    return {
      ...institution,
      name: fullDetails.name || `Institution ${institution.id}`,
      address: fullDetails.address,
      contactEmail: fullDetails.contactEmail,
      contactPhone: fullDetails.contactPhone
    };
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Admin Dashboard</Typography>

      {/* Time range selector */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, newRange) => setTimeRange(newRange)}
          aria-label="time range"
        >
          <ToggleButton value="24h" aria-label="24 hours">
            Last 24h
          </ToggleButton>
          <ToggleButton value="7d" aria-label="7 days">
            Last 7d
          </ToggleButton>
          <ToggleButton value="30d" aria-label="30 days">
            Last 30d
          </ToggleButton>
          <ToggleButton value="all" aria-label="All time">
            All Time
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

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
              <Typography variant="h4">{allInstitutions.length}</Typography>
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
            <Box sx={{ mb: 2 }}>
              {uniqueModalities.map(modality => (
                <Chip
                  key={modality}
                  label={modality}
                  onClick={() => {
                    if (activeModalities.includes(modality)) {
                      setActiveModalities(activeModalities.filter(m => m !== modality));
                    } else {
                      setActiveModalities([...activeModalities, modality]);
                    }
                  }}
                  color={activeModalities.includes(modality) ? "primary" : "default"}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
            <ResponsiveContainer width="100%" height={250}>
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

        {/* Modalities per Institution - Stacked Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Modality Distribution by Institution
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Click legend items to filter modalities
              </Typography>
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={stackedChartData}
                layout="vertical"
                margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
                stackOffset="expand"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="institution" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    
                    return (
                      <Paper sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {label}
                        </Typography>
                        <Typography variant="body2">
                          Total Studies: {payload[0].payload.total}
                        </Typography>
                        {payload.map((entry, index) => (
                          <Box key={`tooltip-${index}`} sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mt: 0.5
                          }}>
                            <Box sx={{
                              width: 12,
                              height: 12,
                              bgcolor: entry.color,
                              mr: 1,
                              borderRadius: '2px'
                            }} />
                            <Typography variant="body2">
                              {entry.name}: {Math.round(entry.value * payload[0].payload.total)} (
                              {(entry.value * 100).toFixed(1)}%)
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    );
                  }}
                />
                <Legend 
                  onClick={(e) => {
                    const clickedModality = e.value;
                    setActiveModalities(prev => 
                      prev.includes(clickedModality)
                        ? prev.filter(m => m !== clickedModality)
                        : [...prev, clickedModality]
                    );
                  }}
                />
                {uniqueModalities.map((modality, index) => (
                  <Bar
                    key={`bar-${modality}`}
                    dataKey={modality}
                    stackId="a"
                    name={modality}
                    fill={COLORS[index % COLORS.length]}
                    hide={!activeModalities.includes(modality)}
                  >
                    {stackedChartData.map((entry, entryIndex) => (
                      <Cell 
                        key={`cell-${modality}-${entryIndex}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Institutions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Top Institutions</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={topInstitutions}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#64748B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
