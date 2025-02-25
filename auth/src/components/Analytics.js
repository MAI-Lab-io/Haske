import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Papa from "papaparse";

const Analytics = ({ file }) => {
  const [sessionData, setSessionData] = useState([]);

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      processLogData(csv.data);
    };
    reader.readAsText(file);
  }, [file]);

  const processLogData = (logEntries) => {
    const sessions = {};
    const processedData = [];

    logEntries.forEach(({ Timestamp, Event, User }) => {
      if (!Timestamp || !Event || !User) return;
      const time = new Date(Timestamp);

      if (Event.includes("signed in")) {
        sessions[User] = time;
      } else if (Event.includes("signed out") && sessions[User]) {
        const duration = (time - sessions[User]) / 60000; // Convert ms to minutes
        processedData.push({
          user: User,
          timestamp: time,
          duration
        });
        delete sessions[User];
      }
    });

    setSessionData(processedData);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={sessionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} />
        <YAxis label={{ value: "Duration (mins)", angle: -90, position: "insideLeft" }} />
        <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
        <Legend />
        <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Session Duration" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Analytics;
