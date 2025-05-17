import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, Button, Menu, MenuItem } from "@mui/material";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, YAxis } from "recharts";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const Analytics = ({ darkMode }) => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetch("https://haske.online:8090/api/verification/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.logs)) {
          // Filter out any invalid log entries
          const validLogs = data.logs.filter(log => 
            log?.action && typeof log.action === 'string' && 
            log?.email && typeof log.email === 'string' &&
            log?.timestamp
          );
          setLogs(validLogs);
        } else {
          console.error("Unexpected API response format:", data);
          setLogs([]);
        }
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      (log.action?.toLowerCase() === "user signed in" || log.action?.toLowerCase() === "user signed out") &&
      (search ? log.email?.toLowerCase().includes(search.toLowerCase()) : true)
  );

  // Rest of your component remains the same...
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Add null checks in your userSessions calculation
  const userSessions = {};
  filteredLogs.forEach((log) => {
    if (!log?.email) return;
    
    if (!userSessions[log.email]) {
      userSessions[log.email] = [];
    }
    userSessions[log.email].push({ 
      action: log.action || '', 
      timestamp: new Date(log.timestamp) 
    });
  });


  // Calculate total active time per user per day (in hours)
  const aggregatedData = {};
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13); // Get the date 13 days ago to include the current day

  // Initialize all dates in the last 2 weeks
  for (let i = 0; i < 14; i++) {
    const date = new Date(twoWeeksAgo);
    date.setDate(twoWeeksAgo.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    aggregatedData[dateKey] = { date: dateKey };

    // Initialize all users for this date with 0 active time
    Object.keys(userSessions).forEach((email) => {
      aggregatedData[dateKey][email] = 0;
    });
  }

  // Populate active time for each user
  Object.keys(userSessions).forEach((email) => {
    const sessions = userSessions[email];
    sessions.sort((a, b) => a.timestamp - b.timestamp); // Sort sessions by timestamp

    let activeSessions = []; // Stack to track active sessions

    sessions.forEach((session) => {
      if (session.action.toLowerCase() === "user signed in") {
        // Push the sign-in timestamp to the stack
        activeSessions.push(session.timestamp);
      } else if (session.action.toLowerCase() === "user signed out" && activeSessions.length > 0) {
        // Pop the last sign-in timestamp from the stack
        const signInTimestamp = activeSessions.pop();
        const duration = (session.timestamp - signInTimestamp) / 1000 / 60 / 60; // Duration in hours
        const dateKey = signInTimestamp.toISOString().split("T")[0]; // Format as YYYY-MM-DD

        // Only include logs from the last 2 weeks
        if (signInTimestamp >= twoWeeksAgo) {
          if (!userColors[email]) {
            userColors[email] = colors[colorIndex % colors.length];
            colorIndex++;
          }
          aggregatedData[dateKey][email] += duration;
        }
      }
    });

    // Handle any remaining active sessions (sign-ins without sign-outs)
    activeSessions.forEach((signInTimestamp) => {
      const dateKey = signInTimestamp.toISOString().split("T")[0];
      if (signInTimestamp >= twoWeeksAgo) {
        // Optionally, you can add a default duration for incomplete sessions
        aggregatedData[dateKey][email] += 0; // Default duration of 0 hours
      }
    });
  });

  // Convert aggregated data to an array and sort by date
  const chartDataArray = Object.values(aggregatedData).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Debug: Log the chart data
  console.log("Aggregated Data:", aggregatedData);
  console.log("Chart Data Array:", chartDataArray);
  console.log("User Colors:", userColors);

  // Dynamic colors for dark/light mode
  const backgroundColor = darkMode ? "#0F172A" : "#E5E7EB";
  const textColor = darkMode ? "#E5E7EB" : "#0F172A";
  const gridColor = darkMode ? "#444" : "#ddd";
  const tooltipBackgroundColor = darkMode ? "#1E1E1E" : "#fff";
  const tooltipTextColor = darkMode ? "#E5E7EB" : "#0F172A";
  const buttonBackgroundColor = darkMode ? "#dd841a" : "#0F172A";
  const buttonTextColor = darkMode ? "#0F172A" : "#E5E7EB";

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, backgroundColor, color: textColor }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center", color: "#dd841a" }}>
        Analytics
      </Typography>

      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#dd841a" }}>Filter by Email</Typography>
      <TextField
        label="Search by Email"
        variant="outlined"
        size="small"
        sx={{ backgroundColor: textColor, borderRadius: 1, mb: 2, input: { color: backgroundColor } }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Button
        variant="contained"
        startIcon={<FileDownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ backgroundColor: buttonBackgroundColor, color: buttonTextColor }}
      >
        Export Data
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport("csv")}>Export as CSV</MenuItem>
        <MenuItem onClick={() => handleExport("txt")}>Export as TXT</MenuItem>
      </Menu>

      {/* Chart Display */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartDataArray} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            stroke={textColor}
            angle={-20}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12, fill: textColor }}
            height={60}
          />
          <YAxis
            stroke={textColor}
            tick={{ fill: textColor }}
            label={{ value: "Active Time (hours)", angle: -90, position: "insideLeft", fill: textColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBackgroundColor,
              color: tooltipTextColor,
              border: `1px solid ${darkMode ? "#dd841a" : "#0F172A"}`,
            }}
            formatter={(value) => `${value.toFixed(2)} hours`} // Format tooltip to show hours
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: textColor }} />
          {Object.keys(userColors).map((email) => (
            <Bar
              key={email}
              dataKey={email}
              name={email}
              fill={userColors[email]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Table Display */}
      <Table sx={{ mt: 3, backgroundColor, color: textColor, borderRadius: 2 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#dd841a" }}>
            <TableCell sx={{ color: buttonTextColor }}>User Email</TableCell>
            <TableCell sx={{ color: buttonTextColor }}>Action</TableCell>
            <TableCell sx={{ color: buttonTextColor }}>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedLogs.length > 0 ? (
            sortedLogs.map((log, index) => (
              <TableRow key={index} sx={{ borderBottom: `1px solid ${gridColor}` }}>
                <TableCell sx={{ color: textColor }}>{log.email}</TableCell>
                <TableCell sx={{ color: "#dd841a" }}>{log.action}</TableCell>
                <TableCell sx={{ color: textColor, fontSize: "0.875rem" }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} sx={{ textAlign: "center", color: textColor }}>No logs available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Analytics;
