import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, MenuItem } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const Analytics = () => {
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://haske.online:8080/api/verification/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);

          const actionCounts = data.logs.reduce((acc, log) => {
            acc[log.timestamp] = acc[log.timestamp] || { timestamp: log.timestamp, signIn: 0, signOut: 0 };
            if (log.action === "Sign In") acc[log.timestamp].signIn++;
            if (log.action === "Sign Out") acc[log.timestamp].signOut++;
            return acc;
          }, {});

          setChartData(Object.values(actionCounts));
        } else {
          console.error("Unexpected API response format:", data);
          setLogs([]);
          setChartData([]);
        }
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  const filteredLogs = logs.filter(log =>
    (filter ? log.action === filter : true) &&
    (search ? log.email.toLowerCase().includes(search.toLowerCase()) : true)
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, backgroundColor: "#1E1E1E", color: "#fff" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>User Activity Logs</Typography>
      
      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <TextField 
          label="Search by Email"
          variant="outlined"
          size="small"
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          select
          label="Filter by Action"
          variant="outlined"
          size="small"
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Sign In">Sign In</MenuItem>
          <MenuItem value="Sign Out">Sign Out</MenuItem>
        </TextField>
      </div>

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
          <XAxis dataKey="timestamp" stroke="#ccc" tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} />
          <YAxis stroke="#ccc" />
          <Tooltip contentStyle={{ backgroundColor: "#1E1E1E", color: "#fff" }} />
          <Legend verticalAlign="top" height={36} />
          <Area type="monotone" dataKey="signIn" name="Sign In" stroke="#4CAF50" fillOpacity={1} fill="url(#colorSignIn)" />
          <Area type="monotone" dataKey="signOut" name="Sign Out" stroke="#FF5252" fillOpacity={1} fill="url(#colorSignOut)" />
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
          {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
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
