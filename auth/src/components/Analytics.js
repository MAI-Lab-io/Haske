import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, Button, Menu, MenuItem } from "@mui/material";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
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
      log.action.toLowerCase() === "user signed in" &&
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
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, backgroundColor: "#0F172A", color: "#E5E7EB" }}> {/* Updated background and text color */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center", color: "#dd841a" }}> {/* Updated title color */}
        User Activity Logs
      </Typography>

      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#dd841a" }}>Filter by Email</Typography> {/* Updated subtitle color */}
      <TextField
        label="Search by Email"
        variant="outlined"
        size="small"
        sx={{ backgroundColor: "#E5E7EB", borderRadius: 1, mb: 2, input: { color: "#0F172A" } }} {/* Updated input background and text color */}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ backgroundColor: "#dd841a", color: "#0F172A" }}> {/* Updated button color */}
        Export Data
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport("csv")}>Export as CSV</MenuItem>
        <MenuItem onClick={() => handleExport("txt")}>Export as TXT</MenuItem>
      </Menu>

      {/* Chart Display */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartDataArray} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /> {/* Updated grid color */}
          <XAxis
            dataKey="week"
            stroke="#E5E7EB" // Updated axis color
            angle={-20}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12, fill: "#E5E7EB" }} // Updated tick color
            height={60}
          />
          <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#E5E7EB", border: "1px solid #dd841a" }} /> {/* Updated tooltip color */}
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#E5E7EB" }} /> {/* Updated legend color */}
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
      <Table sx={{ mt: 3, backgroundColor: "#0F172A", color: "#E5E7EB", borderRadius: 2 }}> {/* Updated table background and text color */}
        <TableHead>
          <TableRow sx={{ backgroundColor: "#dd841a" }}> {/* Updated header background color */}
            <TableCell sx={{ color: "#0F172A" }}>User Email</TableCell> {/* Updated header text color */}
            <TableCell sx={{ color: "#0F172A" }}>Action</TableCell>
            <TableCell sx={{ color: "#0F172A" }}>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <TableRow key={index} sx={{ borderBottom: "1px solid #E5E7EB" }}> {/* Updated border color */}
                <TableCell sx={{ color: "#E5E7EB" }}>{log.email}</TableCell>
                <TableCell sx={{ color: "#dd841a" }}>{log.action}</TableCell>
                <TableCell sx={{ color: "#E5E7EB", fontSize: "0.875rem" }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} sx={{ textAlign: "center", color: "#E5E7EB" }}>No logs available</TableCell> {/* Updated no-data text color */}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Analytics;
