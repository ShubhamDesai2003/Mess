// src/components/MealRatingCard.js
import React, { useState, useEffect } from 'react';
import { Rate, message } from 'antd';
import api from "../../index";

export default function MealRatingCard({ day, mealType }) {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    api
      .get(`/api/user/getRating`, { params: { day, mealType } })
      .then((res) => setRating(res.data.rating || 0))
      .catch(() => {});
  }, [day, mealType]);

  const handleRate = (value) => {
    setRating(value);
    api
      .post(`/api/user/rateMeal`, { day, mealType, rating: value })
      .then(() => message.success("Rating saved"))
      .catch(() => message.error("Failed to save rating"));
  };

  return (
    <div style={{ marginTop: 4 }}>
      Your Rating:{" "}
      <Rate
        value={rating}
        onChange={handleRate}
        allowClear={false}
      />
    </div>
  );
}
