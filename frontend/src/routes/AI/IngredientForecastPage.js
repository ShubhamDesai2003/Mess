// src/routes/IngredientForecastPage.js
import React, { useEffect, useState } from "react";
import { Table, Card, Spin, Alert } from "antd";
import axios from "axios";
import api from "../..";

export default function IngredientForecastPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Ingredients");
    
    api.get("api/admin/forecast/ingredients")
      .then(res => {
        // transform the object into an array for Table
        const arr = Object.entries(res.data).map(([name, { unit, estimated_quantity }]) => ({
          key: name,
          name,
          unit,
          quantity: estimated_quantity
        }));
        setData(arr);
      })
      .catch(err => {
        console.error(err);
        setError("Could not load ingredient forecast.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin style={{ margin: 50 }} />;
  if (error) return <Alert type="error" message={error} style={{ margin: 50 }} />;

  const columns = [
    { title: "Ingredient", dataIndex: "name", key: "name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", render: q => q.toLocaleString() },
    { title: "Unit", dataIndex: "unit", key: "unit" }
  ];

  return (
    <Card title="Monthly Ingredient Forecast" style={{ margin: 24 }}>
      <Table dataSource={data} columns={columns} pagination={false} />
    </Card>
  );
}
