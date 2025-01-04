import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";
import "./MoodTracker.css";
import Sidebar from "./Sidebar";
import axios from "axios";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];

const moods = [
  { name: "Happy", color: "#4caf50" },
  { name: "Stressed", color: "#ff9800" },
  { name: "Angry", color: "#f44336" },
  { name: "Calm", color: "#2196f3" },
  { name: "Excited", color: "#ffc107" },
  { name: "Sad", color: "#9c27b0" },
  { name: "Tired", color: "#607d8b" },
  { name: "Confused", color: "#8bc34a" },
  { name: "Anxious", color: "#e91e63" },
  { name: "Content", color: "#03a9f4" },
  { name: "Frustrated", color: "#ff5722" },
  { name: "Relaxed", color: "#009688" },
];

function MoodTracker() {
  const [currentDay, setCurrentDay] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodMap, setMoodMap] = useState({}); // Store moods for each tile

  // Fetch moods from backend
  useEffect(() => {
    const fetchMoodLogs = async () => {
      try {
        const token = localStorage.getItem("auth");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }
  
        const response = await axios.get("http://localhost:8000/api/moodlogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.status === 200) {
          const data = response.data;
          console.log("Fetched mood logs:", data);
  
          // Update moodMap with fetched data
          setMoodMap(
            data.reduce((map, log) => {
              const logDate = log.date.split("T")[0]; // Ensure date format is YYYY-MM-DD
              map[logDate] = log.mood;
              return map;
            }, {})
          );
        }
      } catch (error) {
        console.error("Error fetching mood logs:", error.message);
      }
    };
  
    fetchMoodLogs(); // Fetch moods when the component loads
  }, []); // Empty dependency array to run only once

  const nextMonth = () => setCurrentDay(new Date(currentDay.setMonth(currentDay.getMonth() + 1)));
  const previousMonth = () => setCurrentDay(new Date(currentDay.setMonth(currentDay.getMonth() - 1)));

  const handleDateClick = async (day) => {
    if (selectedMood) {
      const dateKey = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.number).padStart(2, '0')}`;

      // Update local state for immediate feedback
      setMoodMap((prevMoodMap) => ({
        ...prevMoodMap,
        [dateKey]: selectedMood.name, // Associate dateKey with selected mood
      }));

      try {
        const token = localStorage.getItem("auth");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        // Send date and mood to the backend
        await axios.post(
          "http://localhost:8000/api/moodlogs",
          { date: new Date(day.date).toISOString(), mood: selectedMood.name, notes: "" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Mood log saved successfully");
      } catch (err) {
        console.error("Error saving mood log:", err.message);
      }
    }
  };

  const renderDays = () => {
    const firstDayOfMonth = new Date(currentDay.getFullYear(), currentDay.getMonth(), 1);
    const weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays = [];
    let firstDate = new Date(firstDayOfMonth);
  
    if (weekdayOfFirstDay !== 0) {
      firstDate.setDate(firstDayOfMonth.getDate() - weekdayOfFirstDay);
    }
  
    for (let i = 0; i < 42; i++) {
      const dayData = {
        currentMonth: firstDate.getMonth() === currentDay.getMonth(),
        date: new Date(firstDate),
        month: firstDate.getMonth(),
        number: firstDate.getDate(),
        year: firstDate.getFullYear(),
      };
      currentDays.push(dayData);
      firstDate.setDate(firstDate.getDate() + 1);
    }
  
    return (
      <div className="table-content">
        {currentDays.map((day, index) => {
          // Ensure consistent dateKey formatting
          const dateKey = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.number).padStart(2, '0')}`;
          const moodName = moodMap[dateKey]; // Get mood from moodMap
          const backgroundColor = moods.find((mood) => mood.name === moodName)?.color || "#f9f9f9";
          const textColor = day.currentMonth ? "#333" : "#aaa"; // Faded color for days outside the month
  
          return (
            <div
              key={index}
              className={`calendar-day${day.currentMonth ? " current" : ""}`}
              style={{ backgroundColor }}
              onClick={() => day.currentMonth && handleDateClick(day)}
            >
              <p style={{ color: textColor }}>{day.number}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Prepare data for the bar graph
  const moodCounts = moods.reduce((acc, mood) => {
    acc[mood.name] = Object.values(moodMap).filter((selectedMood) => selectedMood === mood.name).length;
    return acc;
  }, {});

  const graphData = {
    labels: moods.map((mood) => mood.name), // X-axis labels: Mood names
    datasets: [
      {
        label: "Mood Count", // Label for the dataset
        data: moods.map((mood) => moodCounts[mood.name] || 0), // Count of each mood
        backgroundColor: moods.map((mood) => mood.color), // Use mood colors for bars
        borderWidth: 1,
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true, // Start Y-axis at 0
        ticks: { stepSize: 1 }, // Step size for ticks
      },
      x: {
        grid: { display: false }, // No gridlines for X-axis
      },
    },
    plugins: {
      legend: { display: false }, // Hide legend (single dataset)
    },
  };

  return (
    <div className="moodtracker-container">
      <Sidebar />
      <div className="moodtracker-content">
        <h1 className="moodtracker-title">Mood Tracker</h1>
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <div className="title">
                <h2>{months[currentDay.getMonth()]} {currentDay.getFullYear()}</h2>
              </div>
              <div className="tools">
                <button onClick={previousMonth}>{"<"}</button>
                <button onClick={nextMonth}>{">"}</button>
              </div>
            </div>
            <div className="calendar-body">
              <div className="table-header">
                {weekdays.map((weekday) => (
                  <div key={weekday} className="weekday">
                    <p>{weekday}</p>
                  </div>
                ))}
              </div>
              {renderDays()}
            </div>
          </div>
          <div className="mood-key">
            <h3>Select a Mood</h3>
            {moods.map((mood) => (
              <div
                key={mood.name}
                className="mood-option"
                style={{
                  backgroundColor: mood.color,
                  border: selectedMood?.name === mood.name ? "2px solid black" : "none",
                }}
                onClick={() => setSelectedMood(mood)}
              >
                {mood.name}
              </div>
            ))}
          </div>
        </div>

        {/* Mood Tracker Graph */}
        <div className="mood-graph">
          <h3>Mood Tracker Graph</h3>
          <Bar data={graphData} options={graphOptions} />
        </div>
      </div>
    </div>
  );
}

export default MoodTracker;
