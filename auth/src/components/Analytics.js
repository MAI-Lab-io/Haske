import React, { useEffect, useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, Typography, TextField, Button, Menu, MenuItem,
  Select, FormControl, InputLabel, Box, Grid, Card, CardContent
} from "@mui/material";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, YAxis, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import {
  FileDownload as FileDownloadIcon,
  Person as PersonIcon,
  Event as EventIcon, 
  Timeline as TimelineIcon,
  Devices as DevicesIcon
} from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

async function db(data) {
  const MAX_RETRIES = 3;
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch('https://api.haske.online/api/analytics/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      attempt++;
      if (attempt === MAX_RETRIES) {
        console.error('Failed to log analytics after 3 attempts:', error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

const Analytics = ({ darkMode }) => {
  const [data, setData] = useState({
    logs: [],
    chartData: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const colors = darkMode 
    ? ["#dd841a", "#4CAF50", "#2196F3", "#9C27B0", "#FF5722"] 
    : ["#0F172A", "#4CAF50", "#2196F3", "#9C27B0", "#FF5722"];

  useEffect(() => {
    fetchAnalytics();
  }, [search, actionFilter, startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = `https://api.haske.online/api/analytics/logs?`;
      if (search) url += `&email=${encodeURIComponent(search)}`;
      if (actionFilter) url += `&action=${encodeURIComponent(actionFilter)}`;
      if (startDate) url += `&startDate=${startDate.toISOString()}`;
      if (endDate) url += `&endDate=${endDate.toISOString()}`;

      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    let dataString = "";

    if (format === "csv") {
      dataString += "Email,Action,Timestamp,User Agent\n";
      data.logs.forEach((log) => {
        dataString += `"${log.email}","${log.action}","${new Date(log.timestamp).toLocaleString()}","${log.userAgent}"\n`;
      });
    } else if (format === "json") {
      dataString = JSON.stringify(data.logs, null, 2);
    }

    const blob = new Blob([dataString], { type: format === "csv" ? "text/csv" : "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionTypes = () => {
    const actions = new Set();
    data.logs.forEach(log => actions.add(log.action));
    return Array.from(actions).sort();
  };

  // Theme colors
  const backgroundColor = darkMode ? "#0F172A" : "#E5E7EB";
  const textColor = darkMode ? "#E5E7EB" : "#0F172A";
  const cardColor = darkMode ? "#1E293B" : "#FFFFFF";
  const gridColor = darkMode ? "#444" : "#ddd";

  if (loading) {
    return (
      <Paper sx={{ p: 3, backgroundColor, color: textColor }}>
        <Typography>Loading analytics data...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, backgroundColor, color: textColor }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#dd841a" }}>
        User Analytics Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: cardColor }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Unique Users</Typography>
                  <Typography variant="h4">{data.stats.uniqueUsers || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: cardColor }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Total Actions</Typography>
                  <Typography variant="h4">{data.stats.totalLogs || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: cardColor }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TimelineIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Top Action</Typography>
                  <Typography variant="h6">
                    {data.stats.mostCommonAction?.[0] || 'N/A'} ({data.stats.mostCommonAction?.[1] || 0})
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: cardColor }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DevicesIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Top Device</Typography>
                  <Typography variant="h6">
                    {data.stats.deviceStats?.[0]?.[0] || 'N/A'} ({data.stats.deviceStats?.[0]?.[1] || 0})
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField
          label="Search by Email"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ backgroundColor: cardColor }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200, backgroundColor: cardColor }}>
          <InputLabel>Filter by Action</InputLabel>
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            label="Filter by Action"
          >
            <MenuItem value="">All Actions</MenuItem>
            {getActionTypes().map((action) => (
              <MenuItem key={action} value={action}>{action}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          className="date-picker"
          wrapperClassName="date-picker-wrapper"
        />
        
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
          className="date-picker"
          wrapperClassName="date-picker-wrapper"
        />
        
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ backgroundColor: "#dd841a", color: textColor }}
        >
          Export Data
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { handleExport("csv"); setAnchorEl(null); }}>Export as CSV</MenuItem>
          <MenuItem onClick={() => { handleExport("json"); setAnchorEl(null); }}>Export as JSON</MenuItem>
        </Menu>
      </Box>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: cardColor }}>
            <Typography variant="h6" sx={{ mb: 2, color: textColor }}>Activity Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="date" 
                  stroke={textColor}
                  tick={{ fill: textColor }}
                />
                <YAxis stroke={textColor} tick={{ fill: textColor }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: cardColor, 
                    borderColor: gridColor,
                    color: textColor
                  }}
                />
                <Legend wrapperStyle={{ color: textColor }} />
                <Line 
                  type="monotone" 
                  dataKey="signIns" 
                  name="Sign Ins" 
                  stroke={colors[0]} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="signOuts" 
                  name="Sign Outs" 
                  stroke={colors[1]} 
                />
                <Line 
                  type="monotone" 
                  dataKey="pageViews" 
                  name="Page Views" 
                  stroke={colors[2]} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: cardColor }}>
            <Typography variant="h6" sx={{ mb: 2, color: textColor }}>Action Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data.stats.actionCounts || {}).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {Object.keys(data.stats.actionCounts || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: cardColor, 
                    borderColor: gridColor,
                    color: textColor
                  }}
                />
                <Legend wrapperStyle={{ color: textColor }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Logs Table */}
      <Typography variant="h6" sx={{ mb: 2, color: textColor }}>Recent Activity</Typography>
      <Paper sx={{ backgroundColor: cardColor }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: darkMode ? '#1E293B' : '#E5E7EB' }}>
              <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Browser</TableCell>
              <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>OS/Device</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.logs.length > 0 ? (
              data.logs.slice(0, 50).map((log, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: textColor }}>{log.email}</TableCell>
                  <TableCell sx={{ color: "#dd841a" }}>{log.action}</TableCell>
                  <TableCell sx={{ color: textColor }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ color: textColor }}>
                    {log.metadata?.deviceInfo?.browser || log.browser || 'Unknown'}
                  </TableCell>
                  <TableCell sx={{ color: textColor }}>
                    {log.metadata?.deviceInfo?.os || log.os || 'Unknown'} ({log.deviceType || 'desktop'})
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', color: textColor }}>
                  No activity logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Paper>
  );
};

export default Analytics;
