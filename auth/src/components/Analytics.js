import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Analytics = () => {
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

 useEffect(() => {
  fetch("https://haske.online:8080/api/verification/logs")
    .then((res) => res.json())
    .then((data) => {
      // Ensure data.logs is an array
      if (Array.isArray(data.logs)) {
        setLogs(data.logs);
        
        // Aggregate actions count for chart
        const actionCounts = data.logs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {});

        const formattedData = Object.keys(actionCounts).map((key) => ({ action: key, count: actionCounts[key] }));
        setChartData(formattedData);
      } else {
        console.error("Unexpected API response format:", data);
        setLogs([]); // Avoid errors in case of unexpected response
        setChartData([]);
      }
    })
    .catch((error) => console.error("Error fetching logs:", error));
}, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">User Activity Logs</Typography>

      {/* Activity Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="action" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>

      {/* Activity Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User Email</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
            <TableBody>
            {Array.isArray(logs) ? logs.map((log) => (
              <TableRow key={log.timestamp}>
                <TableCell>{log.email}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={3}>No logs available</TableCell>
              </TableRow>
            )}
          </TableBody>
      </Table>
    </Paper>
  );
};

export default Analytics;
