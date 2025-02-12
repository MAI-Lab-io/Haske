import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const Analytics = () => {
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);

          // Aggregate actions count separately for Sign In and Sign Out
          const actionCounts = data.logs.reduce((acc, log) => {
            if (log.action === "Sign In" || log.action === "Sign Out") {
              acc[log.action] = (acc[log.action] || 0) + 1;
            }
            return acc;
          }, {});

          // Format data for the chart
          const formattedData = [
            { action: "Sign In", count: actionCounts["Sign In"] || 0 },
            { action: "Sign Out", count: actionCounts["Sign Out"] || 0 },
          ];
          
          setChartData(formattedData);
        } else {
          console.error("Unexpected API response format:", data);
          setLogs([]);
          setChartData([]);
        }
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, backgroundColor: "#1E1E1E", color: "#fff" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>User Activity Logs</Typography>

      {/* Activity Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSignIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSignOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5252" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FF5252" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="action" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip contentStyle={{ backgroundColor: "#1E1E1E", color: "#fff" }} />
          <Legend verticalAlign="top" height={36} />
          <Area type="monotone" dataKey="count" name="Sign In" stroke="#4CAF50" fillOpacity={1} fill="url(#colorSignIn)" />
          <Area type="monotone" dataKey="count" name="Sign Out" stroke="#FF5252" fillOpacity={1} fill="url(#colorSignOut)" />
        </AreaChart>
      </ResponsiveContainer>

      {/* Activity Table */}
      <Table sx={{ mt: 3, backgroundColor: "#282828", color: "#fff", borderRadius: 2 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#333" }}>
            <TableCell sx={{ color: "#4CAF50" }}>User Email</TableCell>
            <TableCell sx={{ color: "#4CAF50" }}>Action</TableCell>
            <TableCell sx={{ color: "#4CAF50" }}>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(logs) ? logs.map((log, index) => (
            <TableRow key={index} sx={{ borderBottom: "1px solid #444" }}>
              <TableCell sx={{ color: "#fff" }}>{log.email}</TableCell>
              <TableCell sx={{ color: log.action === "Sign In" ? "#4CAF50" : "#FF5252" }}>{log.action}</TableCell>
              <TableCell sx={{ color: "#fff" }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={3} sx={{ textAlign: "center", color: "#aaa" }}>No logs available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Analytics;
