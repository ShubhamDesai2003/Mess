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
    <Card title="Meal Recommendations">
      <Space style={{ marginBottom: 12 }}>
        <Input placeholder="user email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
        <Button onClick={fetchRec}>Get recommendations</Button>
      </Space>

      {loading && <Spin />}
      {!loading && data && (
        <>
          <h4>Popular</h4>
          <List dataSource={data.popular} renderItem={item => <List.Item>{item.dish} — {item.count}</List.Item>} />
          <h4>User</h4>
          <List dataSource={data.user} renderItem={item => <List.Item>{item.dish} — {item.count}</List.Item>} />
        </>
      )}
    </Card>
  );
}
