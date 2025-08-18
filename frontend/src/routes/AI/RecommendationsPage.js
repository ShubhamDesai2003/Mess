// src/routes/RecommendationsPage.js
import React, { useEffect, useState } from 'react';
import { Card, List, Spin, Row, Col, Typography } from 'antd';
import api from '../..';
import classes from "./index.module.css"; // ✅ Reuse same styles as IngredientForecastPage

const { Title } = Typography;

export default function RecommendationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRec = async () => {
      try {
        const res = await api.get('/api/admin/forecast/recommendations');
        setData(res.data);
      } catch (e) {
        console.error("❌ Failed to fetch recommendations", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRec();
  }, []);

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <Spin size="large" tip="Loading recommendations..." />
      </div>
    );
  }

  if (!data) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>No recommendations available</div>;
  }

  return (
    <div className={classes.pageContainer}>
      <h1 className={classes.simpleTitleHeader}>Meal Recommendations</h1>

      <Row gutter={24} style={{ marginTop: 20 }}>
        {/* Popular Trends */}
        <Col span={12}>
          <Card bordered className={classes.menuCard}>
            <div className={classes.cardTitle}>
              <span className={classes.weekTitle}>🔥 Popular Trends</span>
            </div>
            <List
              dataSource={(data.popular || []).slice(0, 3)}
              renderItem={(item, index) => (
                <List.Item>
                  <b>{index + 1}.</b> {item.dish}
                  ( <b>{item.count}</b> )

                </List.Item>
              )}
            />

          </Card>
        </Col>

        {/* User Specific */}
        <Col span={12}>
          <Card bordered className={classes.menuCard}>
            <div className={classes.cardTitle}>
              <span className={classes.weekTitle}>👤 Your Favorites</span>
            </div>
            <List
              dataSource={(data.user || []).slice(0, 3)}
              renderItem={(item, index) => (
                <List.Item>
                  <b>{index + 1}.</b> {item.dish}
                  ( <b>{item.count}</b> )
                </List.Item>
              )}
            />

          </Card>
        </Col>
      </Row>
    </div>
  );
}
