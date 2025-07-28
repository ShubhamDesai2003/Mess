// src/routes/IngredientForecastPage.js
import React, { useEffect, useState } from "react";
import { Table, Card, Spin, Alert, Badge, Button, Tooltip, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import api from "../..";
import classes from "./index.module.css"; // ✅ CSS module import

export default function IngredientForecastPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);


  const fetchData = () => {
    setLoading(true);
    api.get("api/admin/forecast/ingredients")
      .then(res => {
        const arr = Object.entries(res.data).map(([name, { unit, estimated_quantity }]) => ({
          key: name,
          name,
          unit,
          quantity: estimated_quantity
        }));
        setData(arr);
        setLastUpdated(new Date());
      })
      .catch(err => {
        console.error(err);
        setError("Could not load ingredient forecast.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { title: "Ingredient", dataIndex: "name", key: "name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", render: q => q.toLocaleString() },
    { title: "Unit", dataIndex: "unit", key: "unit" }
  ];

  if (loading) {
    return <div className={classes.loadingContainer}><Spin size="large" tip="Loading forecast..." /></div>;
  }

  if (error) {
    return <Alert type="error" message={error} style={{ margin: 50 }} />;
  }

  return (
    <div className={classes.pageContainer}>
      <h1 className={classes.simpleTitleHeader}>Ingredient Forecast</h1>

      <Card
        className={classes.menuCard}
        title={
          <div className={classes.cardTitle}>
            <span className={classes.weekTitle}>
              {/* <Badge status="processing" text="`${nextMonth}Month Ingredient Forecast`" /> */}
              <Badge status="processing" text={`${nextMonth.toLocaleString('default', { month: 'long' })} month Ingredient Forecast`} />
            </span>
          </div>
        }
        extra={
          <Space>
            <Tooltip title="Refresh data">
              <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
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

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
}

