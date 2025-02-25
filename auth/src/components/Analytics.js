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

    const aggregatedData = {};
    Object.keys(userSessions).forEach((email) => {
      userSessions[email].forEach((session) => {
        if (session.logout) {
          const duration = (session.logout - session.login) / (1000 * 60 * 60); // Duration in hours
          const day = session.login.toISOString().split("T")[0]; // Extract YYYY-MM-DD

          if (!aggregatedData[day]) {
            aggregatedData[day] = { date: day };
          }
          if (!aggregatedData[day][email]) {
            aggregatedData[day][email] = 0;
          }
          aggregatedData[day][email] += duration;
        }
      });
    });

    return Object.values(aggregatedData);
  };

  const chartData = processLogs(filteredLogs);

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
        User Login Activity Per Day
      </Typography>

      <TextField
        label="Search by Email"
        variant="outlined"
        size="small"
        sx={{ backgroundColor: "#E5E7EB", borderRadius: 1, mb: 2, input: { color: "#0F172A" } }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="date" stroke="#E5E7EB" tick={{ fontSize: 12, fill: "#E5E7EB" }} />
          <YAxis stroke="#E5E7EB" tick={{ fontSize: 12, fill: "#E5E7EB" }} />
          <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#E5E7EB", border: "1px solid #dd841a" }} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#E5E7EB" }} />
          {Object.keys(userColors).map((email) => (
            <Area key={email} type="monotone" dataKey={email} stackId="1" stroke={userColors[email]} fill={userColors[email]} fillOpacity={0.6} />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <Table sx={{ mt: 3, backgroundColor: "#0F172A", color: "#E5E7EB", borderRadius: 2 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#dd841a" }}>
            <TableCell sx={{ color: "#0F172A" }}>Date</TableCell>
            {Object.keys(userColors).map((email) => (
              <TableCell key={email} sx={{ color: "#0F172A" }}>{email}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {chartData.map((row, index) => (
            <TableRow key={index} sx={{ borderBottom: "1px solid #E5E7EB" }}>
              <TableCell sx={{ color: "#E5E7EB" }}>{row.date}</TableCell>
              {Object.keys(userColors).map((email) => (
                <TableCell key={email} sx={{ color: "#E5E7EB" }}>{(row[email] || 0).toFixed(2)} hours</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Analytics;
