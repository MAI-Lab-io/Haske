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
  CartesianGrid,
  Treemap,
  Rectangle
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
    modalitiesPerInstitution: [],
    totalStudies: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both endpoints in parallel
        const [statsResponse, dicomResponse] = await Promise.all([
          fetch("https://haske.online:8090/api/verification/stats"),
          fetch("https://haske.online:8090/api/dicom-stats")
        ]);

        if (!statsResponse.ok) throw new Error("Failed to fetch user stats");
        if (!dicomResponse.ok) throw new Error("Failed to fetch DICOM stats");

        const [statsData, dicomData] = await Promise.all([
          statsResponse.json(),
          dicomResponse.json()
        ]);

        setStats(statsData);
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

  const topInstitutions = [...dicomStats.institutions]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topModalitiesPerInstitution = [...dicomStats.modalitiesPerInstitution]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

// Format data for treemap
    const formatTreemapData = (data) => {
      const institutions = {};
      
      data.forEach(item => {
        if (!institutions[item.institution]) {
          institutions[item.institution] = {
            name: item.institution,
            children: []
          };
        }
        institutions[item.institution].children.push({
          name: item.modality,
          count: item.count,
          institution: item.institution,
          modality: item.modality
        });
      });
    
      return {
        name: 'All Institutions',
        children: Object.values(institutions)
      };
    };
    
    // Custom content for treemap
    const CustomizedContent = ({ root, depth, x, y, width, height, index, colors, name }) => {
      return (
        <g>
          <Rectangle
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: depth < 2 ? colors[index % colors.length] : 'rgba(255,255,255,0)',
              stroke: '#fff',
              strokeWidth: 2 / (depth + 1e-10),
              strokeOpacity: 1 / (depth + 1e-10),
            }}
          />
          {depth === 1 ? (
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
            >
              {name}
            </text>
          ) : null}
          {depth === 2 ? (
            <text
              x={x + 4}
              y={y + 18}
              fill="#fff"
              fontSize={16}
              fillOpacity={0.9}
            >
              {name}
            </text>
          ) : null}
        </g>
      );
    };
  

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
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Modality Distribution by Institution (Treemap)
          <Typography variant="body2" color="text.secondary">
            Size = Study Count • Color = Modality Type
          </Typography>
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            width={400}
            height={400}
            data={formatTreemapData(topModalitiesPerInstitution)}
            dataKey="count"
            ratio={4/3}
            stroke="#fff"
            fill="#8884d8"
            isAnimationActive={true}
            animationDuration={800}
            content={<CustomizedContent colors={COLORS} />}
          >
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <Paper sx={{ p: 1.5, border: '1px solid #ddd' }}>
                      <Typography variant="subtitle2">
                        {data.institution || data.name}
                      </Typography>
                      {data.modality && (
                        <Typography>
                          <strong>Modality:</strong> {data.modality}
                        </Typography>
                      )}
                      <Typography>
                        <strong>Studies:</strong> {data.count}
                      </Typography>
                    </Paper>
                  );
                }
                return null;
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  </Paper>
</Grid>

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
