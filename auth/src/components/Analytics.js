import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField } from "@mui/material";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const Analytics = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

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

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase() === "user signed in" &&
    (search ? log.email.toLowerCase().includes(search.toLowerCase()) : true)
  );

  const userColors = {};
  let colorIndex = 0;
  const colors = ["#4CAF50", "#FF5252", "#FF9800", "#2196F3", "#9C27B0", "#00BCD4", "#8BC34A"];

  const aggregatedData = {};
  filteredLogs.forEach((log) => {
    const date = new Date(log.timestamp);
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay())); // Get start of the week
    const formattedWeek = `Week ${Math.ceil(date.getDate() / 7)} (${weekStart.toLocaleDateString()})`;

    if (!aggregatedData[formattedWeek]) {
      aggregatedData[formattedWeek] = { week: formattedWeek };
    }
    if (!userColors[log.email]) {
      userColors[log.email] = colors[colorIndex % colors.length];
      colorIndex++;
    }
    aggregatedData[formattedWeek][log.email] = (aggregatedData[formattedWeek][log.email] || 0) + 1;
  });

  const chartDataArray = Object.values(aggregatedData);

  return (
  <Paper sx={{ 
  p: 3, 
  borderRadius: 3, 
  boxShadow: 4, 
  backgroundColor: "#1E1E1E", 
  color: "#fff",
  maxWidth: "90vw", // Increase max width
  width: "90%", // Make it take up more screen space
  margin: "0 auto" // Center it
}}>

      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
        User Activity Logs
      </Typography>
      
      <TextField
        label="Search by Email"
        variant="outlined"
        size="small"
        sx={{ backgroundColor: "#fff", borderRadius: 1, mb: 2 }}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartDataArray} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="week"
            stroke="#ccc"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={60} // Increased to allow full visibility
          />
          <Tooltip contentStyle={{ backgroundColor: "#1E1E1E", color: "#fff" }} />
          <Legend verticalAlign="top" height={36} />
          {Object.keys(userColors).map((email) => (
            <Area key={email} type="monotone" dataKey={email} name={email} stroke={userColors[email]} fillOpacity={0.3} fill={userColors[email]} />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <Table sx={{ mt: 3, backgroundColor: "#282828", color: "#fff", borderRadius: 2 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#333" }}>
            <TableCell sx={{ color: "#4CAF50" }}>User Email</TableCell>
            <TableCell sx={{ color: "#4CAF50" }}>Action</TableCell>
            <TableCell sx={{ color: "#4CAF50" }}>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <TableRow key={index} sx={{ borderBottom: "1px solid #444" }}>
                <TableCell sx={{ color: "#fff" }}>{log.email}</TableCell>
                <TableCell sx={{ color: "#4CAF50" }}>{log.action}</TableCell>
                <TableCell sx={{ color: "#fff", fontSize: "0.8rem" }}>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
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
