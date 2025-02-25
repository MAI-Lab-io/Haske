import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, Button, Menu, MenuItem } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const Analytics = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
        } else {
          console.error("Unexpected API response format:", data);
          setLogs([]);
        }
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      (log.action.toLowerCase() === "user signed in" || log.action.toLowerCase() === "user signed out") &&
      (search ? log.email.toLowerCase().includes(search.toLowerCase()) : true)
  );

  const handleExport = (format) => {
    let dataString = "";

    if (format === "csv") {
      dataString += "Email,Action,Timestamp\n";
      filteredLogs.forEach((log) => {
        dataString += `${log.email},${log.action},${new Date(log.timestamp).toLocaleString()}\n`;
      });
    } else if (format === "txt") {
      dataString += "User Activity Logs\n\n";
      filteredLogs.forEach((log) => {
        dataString += `Email: ${log.email} | Action: ${log.action} | Timestamp: ${new Date(log.timestamp).toLocaleString()}\n`;
      });
    }

    const blob = new Blob([dataString], { type: format === "csv" ? "text/csv" : "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_logs.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Process logs to calculate session durations and aggregate by time period
  const processLogs = (logs) => {
    const userSessions = {};
    logs.forEach((log) => {
      if (!userSessions[log.email]) {
        userSessions[log.email] = [];
      }
      if (log.action.toLowerCase() === "user signed in") {
        userSessions[log.email].push({ login: new Date(log.timestamp), logout: null });
      } else if (log.action.toLowerCase() === "user signed out") {
        const lastSession = userSessions[log.email].find((session) => !session.logout);
        if (lastSession) {
          lastSession.logout = new Date(log.timestamp);
        }
      }
    });

    // Aggregate session durations by week
    const aggregatedData = {};
    Object.keys(userSessions).forEach((email) => {
      userSessions[email].forEach((session) => {
        if (session.logout) {
          const duration = (session.logout - session.login) / (1000 * 60 * 60); // Duration in hours
          const weekStart = new Date(session.login);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of the week
          const formattedWeek = `Week ${Math.ceil(weekStart.getDate() / 7)} (${weekStart.toLocaleDateString()})`;

          if (!aggregatedData[formattedWeek]) {
            aggregatedData[formattedWeek] = { week: formattedWeek };
          }
          if (!aggregatedData[formattedWeek][email]) {
            aggregatedData[formattedWeek][email] = 0;
          }
          aggregatedData[formattedWeek][email] += duration;
        }
      });
    });

    return Object.values(aggregatedData);
  };

  const chartData = processLogs(filteredLogs);

  // Generate unique colors for each user
  const userColors = {};
  const colors = ["#0F172A", "#E5E7EB", "#dd841a", "#4CAF50", "#FF5252", "#FF9800", "#9C27B0", "#00BCD4", "#8BC34A"];
  let colorIndex = 0;
  filteredLogs.forEach((log) => {
    if (!userColors[log.email]) {
      userColors[log.email] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, backgroundColor: "#0F172A", color: "#E5E7EB" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center", color: "#dd841a" }}>
        User Login Activity Over Time
      </Typography>

      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#dd841a" }}>Filter by Email</Typography>
      <TextField
        label="Search by Email"
        variant="outlined"
        size="small"
        sx={{ backgroundColor: "#E5E7EB", borderRadius: 1, mb: 2, input: { color: "#0F172A" } }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ backgroundColor: "#dd841a", color: "#0F172A" }}>
        Export Data
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport("csv")}>Export as CSV</MenuItem>
        <MenuItem onClick={() => handleExport("txt")}>Export as TXT</MenuItem>
      </Menu>

      {/* Chart Display */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="week"
            stroke="#E5E7EB"
            angle={-20}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12, fill: "#E5E7EB" }}
            height={60}
          />
          <YAxis stroke="#E5E7EB" tick={{ fontSize: 12, fill: "#E5E7EB" }} />
          <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#E5E7EB", border: "1px solid #dd841a" }} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#E5E7EB" }} />
          {Object.keys(userColors).map((email) => (
            <Area
              key={email}
              type="monotone"
              dataKey={email}
              stackId="1"
              stroke={userColors[email]}
              fill={userColors[email]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Table Display */}
      <Table sx={{ mt: 3, backgroundColor: "#0F172A", color: "#E5E7EB", borderRadius: 2 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#dd841a" }}>
            <TableCell sx={{ color: "#0F172A" }}>Week</TableCell>
            {Object.keys(userColors).map((email) => (
              <TableCell key={email} sx={{ color: "#0F172A" }}>{email}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {chartData.length > 0 ? (
            chartData.map((row, index) => (
              <TableRow key={index} sx={{ borderBottom: "1px solid #E5E7EB" }}>
                <TableCell sx={{ color: "#E5E7EB" }}>{row.week}</TableCell>
                {Object.keys(userColors).map((email) => (
                  <TableCell key={email} sx={{ color: "#E5E7EB" }}>{(row[email] || 0).toFixed(2)} hours</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={Object.keys(userColors).length + 1} sx={{ textAlign: "center", color: "#E5E7EB" }}>No login sessions available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Analytics;
