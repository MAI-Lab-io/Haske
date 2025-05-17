import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, Button, Menu, MenuItem } from "@mui/material";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, YAxis } from "recharts";
import FileDownloadIcon from "@mui/icons-material/GitHub";

const Analytics = ({ darkMode }) => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  // Define colors and userColors at the component level
  const colors = darkMode ? ["#0F172A", "#E5E7EB", "#dd841a"] : ["#0F172A", "#E5E7EB", "#dd841a"];
  const [userColors, setUserColors] = useState({});
  let colorIndex = 0;

  useEffect(() => {
    fetch("https://haske.online:8090/api/verification/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.logs)) {
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

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
    const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
    return dateB - dateA;
  });

  const handleExport = (format) => {
    let dataString = "";

    if (format === "csv") {
      dataString += "Email,Action,Timestamp\n";
      sortedLogs.forEach((log) => {
        dataString += `${log.email},${log.action},${new Date(log.timestamp).toLocaleString()}\n`;
      });
    } else if (format === "txt") {
      dataString += "Analytics\n\n";
      sortedLogs.forEach((log) => {
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
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

  // Initialize all dates in the last 2 weeks
  for (let i = 0; i < 14; i++) {
    const date = new Date(twoWeeksAgo);
    date.setDate(twoWeeksAgo.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    aggregatedData[dateKey] = { date: dateKey };

    Object.keys(userSessions).forEach((email) => {
      aggregatedData[dateKey][email] = 0;
    });
  }

  // Temporary object to track colors during this calculation
  const tempUserColors = {...userColors};

  Object.keys(userSessions).forEach((email) => {
    const sessions = userSessions[email];
    sessions.sort((a, b) => a.timestamp - b.timestamp);

    let activeSessions = [];

    sessions.forEach((session) => {
      if (session.action?.toLowerCase() === "user signed in") {
        activeSessions.push(session.timestamp);
      } else if (session.action?.toLowerCase() === "user signed out" && activeSessions.length > 0) {
        const signInTimestamp = activeSessions.pop();
        const duration = (session.timestamp - signInTimestamp) / 1000 / 60 / 60;
        const dateKey = signInTimestamp.toISOString().split("T")[0];

        if (signInTimestamp >= twoWeeksAgo) {
          if (!tempUserColors[email]) {
            tempUserColors[email] = colors[colorIndex % colors.length];
            colorIndex++;
          }
          aggregatedData[dateKey][email] += duration;
        }
      }
    });

    activeSessions.forEach((signInTimestamp) => {
      const dateKey = signInTimestamp.toISOString().split("T")[0];
      if (signInTimestamp >= twoWeeksAgo) {
        aggregatedData[dateKey][email] += 0;
      }
    });
  });

  // Update user colors state if changed
  if (JSON.stringify(tempUserColors) !== JSON.stringify(userColors)) {
    setUserColors(tempUserColors);
  }

  const chartDataArray = Object.values(aggregatedData).sort((a, b) => new Date(a.date) - new Date(b.date));

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
            formatter={(value) => `${value.toFixed(2)} hours`}
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
                <TableCell sx={{ color: textColor, fontSize: "0.875rem" }}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                </TableCell>
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
