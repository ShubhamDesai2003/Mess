// src/routes/PurchaseHistoryPage.js
import React, { useState, useEffect } from "react";
import { Card, Row, Col, message } from "antd";
import api from "../../index";
import MealRatingCard from "../PurchaseHistory/MealRatingCard";
import styles from './index.module.css';


export default function PurchaseHistoryPage() {
  const [activeWeek, setActiveWeek] = useState("this");
  const [purchaseData, setPurchaseData] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/api/data/menu"),
      api.get("/api/user/data")
    ])
      .then(([menuRes, userRes]) => {
        setMenu(menuRes.data);
        setPurchaseData(userRes.data);
      })
      .catch(() => message.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, [activeWeek]);

  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  if (loading) return <div>Loading...</div>;

  return (
    <div       style={{
      marginLeft: "240px",        // ✅ keeps content from overlapping sidebar
      padding: "24px 32px",
      background: "#fff",
      minHeight: "100vh",
      boxSizing: "border-box",
      overflowY: "auto",
    }}>
      <Row gutter={[16, 16]}>
        {days.map(day => {
          const dayMenu = menu.find(m => m.day === day);
          const userWeekData = purchaseData[activeWeek] || {};
          const userMeals = userWeekData[day] || {};

          return (
            <Col span={8} key={day}>
              <Card title={day.charAt(0).toUpperCase() + day.slice(1)}>
                {['breakfast','lunch','dinner'].map(mealType => {
                  const consumed = userMeals[mealType];
                  if (!consumed) {
                    return (
                      <div key={mealType}>
                        <b>{mealType}</b>: Not selected
                      </div>
                    );
                  }

                  return (
                    <div key={mealType} style={{ marginBottom: 12 }}>
                      <b>{mealType}</b>
                      <MealRatingCard day={day} mealType={mealType} />
                    </div>
                  );
                })}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
