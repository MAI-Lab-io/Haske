import React, { useEffect, useState } from "react";
import { Paper, Typography, TextField, MenuItem, Button } from "@mui/material";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import chroma from "chroma-js";

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
        } else {
          console.error("Unexpected API response format:", data);
          setLogs([]);
        }
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  const filteredLogs = logs.filter((log) =>
    (filter ? log.action.toLowerCase() === (filter === "Sign In" ? "user signed in" : "user signed out") : true) &&
    (search ? log.email.toLowerCase().includes(search.toLowerCase()) : true)
  );

  const userColors = {}; // Store unique colors per user
  const colorScale = chroma.scale(["#1E88E5", "#D32F2F", "#388E3C", "#FBC02D"]).mode("lab");

  const groupedData = filteredLogs.reduce((acc, log) => {
    const time = new Date(log.timestamp).toISOString().slice(0, 16); // Group by minute
    if (!acc[time]) acc[time] = { timestamp: time };
    if (!userColors[log.email]) userColors[log.email] = colorScale(Object.keys(userColors).length / 10).hex();
    
    acc[time][log.email] = acc[time][log.email] || { signIn: 0, signOut: 0 };
    if (log.action.toLowerCase() === "user signed in") acc[time][log.email].signIn++;
    if (log.action.toLowerCase() === "user signed out") acc[time][log.email].signOut++;
    return acc;
  }, {});

  const chartDataArray = Object.keys(groupedData).map((time) => {
    const entry = { timestamp: time };
    Object.keys(groupedData[time]).forEach((user) => {
      entry[`${user}_signIn`] = groupedData[time][user].signIn;
      entry[`${user}_signOut`] = -groupedData[time][user].signOut;
    });
    return entry;
  });

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, backgroundColor: "#121212", color: "#fff" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
        User Activity Logs
      </Typography>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "space-between" }}>
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
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartDataArray} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="timestamp" stroke="#ccc" tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} />
          <YAxis stroke="#ccc" />
          <Tooltip contentStyle={{ backgroundColor: "#1E1E1E", color: "#fff" }} />
          <Legend verticalAlign="top" height={36} />
          {Object.keys(userColors).map((user, index) => (
            <>
              <Area
                key={`${user}_signIn`}
                type="monotone"
                dataKey={`${user}_signIn`}
                name={`${user} (Sign In)`}
                stroke={userColors[user]}
                fill={userColors[user]}
                fillOpacity={0.5}
              />
              <Area
                key={`${user}_signOut`}
                type="monotone"
                dataKey={`${user}_signOut`}
                name={`${user} (Sign Out)`}
                stroke={chroma(userColors[user]).darken().hex()}
                fill={chroma(userColors[user]).darken().hex()}
                fillOpacity={0.5}
              />
            </>
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default Analytics;
