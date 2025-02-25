import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, Button, Menu, MenuItem } from "@mui/material";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, YAxis } from "recharts";
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

  const userColors = {};
  let colorIndex = 0;
  const colors = ["#0F172A", "#E5E7EB", "#dd841a"]; // Updated color palette

  // Track user sessions and calculate active time
  const userSessions = {};
  filteredLogs.forEach((log) => {
    if (!userSessions[log.email]) {
      userSessions[log.email] = [];
    }
    userSessions[log.email].push({ action: log.action, timestamp: new Date(log.timestamp) });
  });

  // Calculate total active time per user per day
  const aggregatedData = {};
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); // Get the date 2 weeks ago

  Object.keys(userSessions).forEach((email) => {
    const sessions = userSessions[email];
    sessions.sort((a, b) => a.timestamp - b.timestamp); // Sort sessions by timestamp

    for (let i = 0; i < sessions.length - 1; i += 2) {
      const signIn = sessions[i];
      const signOut = sessions[i + 1];

      if (signIn.action.toLowerCase() === "user signed in" && signOut.action.toLowerCase() === "user signed out") {
        const duration = (signOut.timestamp - signIn.timestamp) / 1000; // Duration in seconds
        const dateKey = signIn.timestamp.toISOString().split("T")[0]; // Format as YYYY-MM-DD

        // Only include logs from the last 2 weeks
        if (signIn.timestamp >= twoWeeksAgo) {
          if (!aggregatedData[dateKey]) {
            aggregatedData[dateKey] = { date: dateKey };
          }
          if (!userColors[email]) {
            userColors[email] = colors[colorIndex % colors.length];
            colorIndex++;
          }
          aggregatedData[dateKey][email] = (aggregatedData[dateKey][email] || 0) + duration;
        }
      }
    }
  });

  // Convert aggregated data to an array and sort by date
  const chartDataArray = Object.values(aggregatedData).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, backgroundColor: "#0F172A", color: "#E5E7EB" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center", color: "#dd841a" }}>
        User Activity Logs (Last 2 Weeks)
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
        <AreaChart data={chartDataArray} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            stroke="#E5E7EB"
            angle={-20}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12, fill: "#E5E7EB" }}
            height={60}
          />
          <YAxis stroke="#E5E7EB" tick={{ fill: "#E5E7EB" }} />
          <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#E5E7EB", border: "1px solid #dd841a" }} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#E5E7EB" }} />
          {Object.keys(userColors).map((email) => (
            <Area
              key={email}
              type="monotone"
              dataKey={email}
              name={email}
              stroke={userColors[email]}
              fillOpacity={0.3}
              fill={userColors[email]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Table Display */}
      <Table sx={{ mt: 3, backgroundColor: "#0F172A", color: "#E5E7EB", borderRadius: 2 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#dd841a" }}>
            <TableCell sx={{ color: "#0F172A" }}>User Email</TableCell>
            <TableCell sx={{ color: "#0F172A" }}>Action</TableCell>
            <TableCell sx={{ color: "#0F172A" }}>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <TableRow key={index} sx={{ borderBottom: "1px solid #E5E7EB" }}>
                <TableCell sx={{ color: "#E5E7EB" }}>{log.email}</TableCell>
                <TableCell sx={{ color: "#dd841a" }}>{log.action}</TableCell>
                <TableCell sx={{ color: "#E5E7EB", fontSize: "0.875rem" }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} sx={{ textAlign: "center", color: "#E5E7EB" }}>No logs available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Analytics;
