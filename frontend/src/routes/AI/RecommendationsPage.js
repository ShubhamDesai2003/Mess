// src/routes/RecommendationsPage.js
import React, {useEffect, useState} from 'react';
import { Card, List, Spin, Alert, Input, Button, Space } from 'antd';
import api from '../..';

export default function RecommendationsPage() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRec = async () => {
    setLoading(true);
    try {
      const res = await api.get('api/admin/forecast/recommendations', { params: { email }});
      setData(res.data);
    } catch (e) {
      setData(null);
      console.error(e);
    } finally { setLoading(false); }
  };

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
              renderItem={item => (
                <List.Item>
                  {item.dish} — <b>{item.count}</b>
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
              renderItem={item => (
                <List.Item>
                  {item.dish} — <b>{item.count}</b>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
