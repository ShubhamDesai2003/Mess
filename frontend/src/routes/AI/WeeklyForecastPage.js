import React, { useEffect, useState } from "react";
import { Table, Card, Spin, Alert, Tooltip, Button, Space, Badge } from "antd";
import { CalendarOutlined, ReloadOutlined } from "@ant-design/icons";
import api from "../..";
import classes from "./index.module.css";

export default function WeeklyForecastPage() {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("Weekly Meal Forecast");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await api.get("api/admin/forecast/weekly");

      const forecastData = res.data;
      const rows = Object.entries(forecastData).map(([day, meals]) => ({
        key: day,
        day: capitalizeFirstLetter(day),
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
      }));

      setData(rows);

      // Dynamically set title: e.g. Aug 5 – Aug 11, 2025
      const today = new Date();
      const nextMonday = getNextMonday(today);
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);

      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      setTitle(`Weekly Meal Forecast (${formatter.format(nextMonday)} – ${formatter.format(nextSunday)})`);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Could not load weekly meal forecast.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const columns = [
    { title: "Day", dataIndex: "day", key: "day" },
    { title: "Breakfast", dataIndex: "breakfast", key: "breakfast" },
    { title: "Lunch", dataIndex: "lunch", key: "lunch" },
    { title: "Dinner", dataIndex: "dinner", key: "dinner" },
  ];

  if (loading) {
    return <div className={classes.loadingContainer}><Spin size="large" tip="Loading forecast..." /></div>;
  }

  if (error) {
    return <Alert type="error" message={error} style={{ margin: 50 }} />;
  }

  return (
    <div className={classes.pageContainer}>
      <h1 className={classes.simpleTitleHeader}>Meal Demand Prediction</h1>

      <Card
        className={classes.menuCard}
        title={
          <div className={classes.cardTitle}>
            <span className={classes.weekTitle}>
              <Badge status="processing" text={title} />
            </span>
          </div>
        }
        extra={
          <Space>
            <Tooltip title="Refresh Forecast">
              <Button icon={<ReloadOutlined />} onClick={fetchForecast} loading={loading}>
                Refresh
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Table dataSource={data} columns={columns} pagination={false} />
      </Card>

      {lastUpdated && (
        <div className={classes.lastUpdated}>
          Last updated: {formatDate(lastUpdated)}
        </div>
      )}
    </div>
  );
}

// Helper Functions
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getNextMonday(date) {
  const day = date.getDay();
  const diff = (8 - day) % 7 || 7;
  const result = new Date(date);
  result.setDate(date.getDate() + diff);
  return result;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}
