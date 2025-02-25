import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, Button, Menu, MenuItem
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
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

  const handleExport = (format) => {
    let dataString = "Email,Action,Timestamp,Duration (Hours)\n";

    logs.forEach((log) => {
      dataString += `${log.email},${log.action},${new Date(log.timestamp).toLocaleString()},${log.duration || 0}\n`;
    });

    const blob = new Blob([dataString], { type: format === "csv" ? "text/csv" : "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_sessions.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Group sessions by user and compute durations
  const userSessions = {};
  logs.forEach((log) => {
    if (!userSessions[log.email]) {
      userSessions[log.email] = [];
    }

    if (log.action.toLowerCase() === "user signed in") {
      userSessions[log.email].push({ timestamp: new Date(log.timestamp).getTime(), duration: 0 });
    } else if (log.action.toLowerCase() === "user signed out") {
      const lastSession = userSessions[log.email].slice(-1)[0];
      if (lastSession) {
        lastSession.duration = (new Date(log.timestamp).getTime() - lastSession.timestamp) / (1000 * 60 * 60); // Convert ms to hours
      }
    }
  });

  // Convert to chart-friendly data format
  const chartData = [];
  Object.keys(userSessions).forEach((email) => {
    userSessions[email].forEach((session, index) => {
      chartData.push({
        name: `${email} - Session ${index + 1}`,
        duration: session.duration,
      });
    });
  });

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, backgroundColor: "#0F172A", color: "#E5E7EB" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center", color: "#dd841a" }}>
        User Login Sessions
      </Typography>

      <TextField
        label="Search by Email"
        variant="outlined"
        size="small"
        sx={{ backgroundColor: "#E5E7EB", borderRadius: 1, mb: 2, input: { color: "#0F172A" } }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Button
        variant="contained"
        startIcon={<FileDownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ backgroundColor: "#dd841a", color: "#0F172A" }}
      >
        Export Data
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport("csv")}>Export as CSV</MenuItem>
        <MenuItem onClick={() => handleExport("txt")}>Export as TXT</MenuItem>
      </Menu>

      {/* Chart Display */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#E5E7EB" angle={-20} textAnchor="end" interval={0} height={80} />
          <YAxis stroke="#E5E7EB" label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#E5E7EB" }} />
          <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#E5E7EB", border: "1px solid #dd841a" }} />
          <Legend wrapperStyle={{ color: "#E5E7EB" }} />
          <Bar dataKey="duration" fill="#dd841a" name="Login Duration (Hours)" />
        </BarChart>
      </ResponsiveContainer>

      {/* Table Display */}
      <Table sx={{ mt: 3, backgroundColor: "#0F172A", color: "#E5E7EB", borderRadius: 2 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#dd841a" }}>
            <TableCell sx={{ color: "#0F172A" }}>User Email</TableCell>
            <TableCell sx={{ color: "#0F172A" }}>Session #</TableCell>
            <TableCell sx={{ color: "#0F172A" }}>Start Time</TableCell>
            <TableCell sx={{ color: "#0F172A" }}>Duration (Hours)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chartData.length > 0 ? (
            chartData.map((session, index) => (
              <TableRow key={index} sx={{ borderBottom: "1px solid #E5E7EB" }}>
                <TableCell sx={{ color: "#E5E7EB" }}>{session.name.split(" - ")[0]}</TableCell>
                <TableCell sx={{ color: "#dd841a" }}>{session.name.split(" - ")[1]}</TableCell>
                <TableCell sx={{ color: "#E5E7EB", fontSize: "0.875rem" }}>
                  {new Date(userSessions[session.name.split(" - ")[0]][index].timestamp).toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: "#E5E7EB" }}>{session.duration.toFixed(2)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} sx={{ textAlign: "center", color: "#E5E7EB" }}>
                No session data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Analytics;
