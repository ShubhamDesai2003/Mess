// src/routes/RecommendationsPage.js
import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { FiStar, FiTrendingUp, FiUser, FiRefreshCw, FiHeart, FiAward, FiThumbsUp } from "react-icons/fi";
import { motion } from "framer-motion";
import api from '../..';
import classes from "./Recommendations.module.css";

export default function RecommendationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const COLORS = ['#f17228', '#e06420', '#d55a1f', '#c64f1e', '#ff8c42', '#ffb380', '#ffd6ba', '#ffe5d3'];

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await api.get('api/data/status');
        setIsAdmin(response.data?.admin || false);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    checkAdmin();
  }, []);

  const fetchRec = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/forecast/recommendations');
      setData(res.data);
    } catch (e) {
      console.error("❌ Failed to fetch recommendations", e);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRec();
  }, []);

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={classes.errorContainer}>
        <div className={classes.errorIcon}>⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p>{error || "No recommendations available"}</p>
        <button onClick={fetchRec} className={classes.retryButton}>
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  const popularData = (data.popular || []).slice(0, 8).map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  const userFavData = (data.user || []).slice(0, 5);

  return (
    <div className={classes.recommendContainer}>
      {/* Hero Section - User Friendly */}
      <motion.div 
        className={classes.heroSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={classes.heroContent}>
          <FiStar className={classes.heroIcon} />
          <h2 className={classes.heroTitle}>What's Popular Today?</h2>
          <p className={classes.heroSubtitle}>
            Discover what everyone is loving! Our AI helps you find the best meals based on real student preferences.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={fetchRec} 
            className={classes.refreshButton}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? classes.spinning : ''} />
            Refresh Data
          </button>
        )}
      </motion.div>

      {/* Top Trending Meals - Large Cards */}
      <motion.div 
        className={classes.trendingSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={classes.sectionHeader}>
          <FiTrendingUp className={classes.sectionIcon} />
          <h3>🔥 Top Trending Meals</h3>
          <p>Most ordered meals this month</p>
        </div>

        <div className={classes.trendingGrid}>
          {popularData.slice(0, 3).map((item, index) => (
            <motion.div
              key={index}
              className={classes.trendingCard}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <div className={classes.trendingRank} style={{background: item.color}}>
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
              </div>
              <div className={classes.trendingInfo}>
                <h4 className={classes.dishName}>{item.dish}</h4>
                <div className={classes.orderStats}>
                  <FiThumbsUp />
                  <span>{item.count.toLocaleString()} people loved this!</span>
                </div>
                {index === 0 && (
                  <div className={classes.badge}>
                    <FiAward /> Most Popular
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* All Popular Meals - Grid View */}
      <motion.div 
        className={classes.allMealsSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className={classes.sectionHeader}>
          <h3>All Popular Choices</h3>
          <p>Ranked by student preferences</p>
        </div>

        <div className={classes.mealsGrid}>
          {popularData.map((item, index) => (
            <motion.div
              key={index}
              className={classes.mealCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={classes.mealRank} style={{background: item.color}}>
                #{index + 1}
              </div>
              <div className={classes.mealInfo}>
                <h5 className={classes.mealName}>{item.dish}</h5>
                <div className={classes.mealMeta}>
                  <span className={classes.orderCount}>
                    <FiHeart style={{color: item.color}} />
                    {item.count} orders
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Favorites Section - If available */}
      {userFavData.length > 0 && (
        <motion.div 
          className={classes.favoritesSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className={classes.sectionHeader}>
            <FiUser className={classes.sectionIcon} />
            <h3>Your Personal Favorites</h3>
            <p>Based on your order history</p>
          </div>

          <div className={classes.favoritesGrid}>
            {userFavData.map((item, index) => (
              <motion.div
                key={index}
                className={classes.favoriteCard}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={classes.favoriteIcon}>⭐</div>
                <div className={classes.favoriteInfo}>
                  <h5>{item.dish}</h5>
                  <p>You've ordered this {item.count} times</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Admin Analytics View */}
      {isAdmin && (
        <motion.div 
          className={classes.analyticsSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className={classes.sectionHeader}>
            <h3>📊 Analytics Dashboard</h3>
            <p>Detailed insights for management</p>
          </div>

          <div className={classes.chartsGrid}>
            {/* Pie Chart */}
            <div className={classes.chartCard}>
              <h4>Distribution of Orders</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={popularData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ dish, percent }) => `${dish}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {popularData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            {userFavData.length > 0 && (
              <div className={classes.chartCard}>
                <h4>User Preferences</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userFavData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="dish" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <RechartsTooltip 
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {userFavData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Key Insights */}
          <div className={classes.insightsCard}>
            <h4>💡 Key Insights</h4>
            <div className={classes.insightsGrid}>
              <div className={classes.insightItem}>
                <div className={classes.insightIcon}>🏆</div>
                <div className={classes.insightContent}>
                  <div className={classes.insightLabel}>Most Popular</div>
                  <div className={classes.insightValue}>{popularData[0]?.dish || 'N/A'}</div>
                </div>
              </div>
              <div className={classes.insightItem}>
                <div className={classes.insightIcon}>📈</div>
                <div className={classes.insightContent}>
                  <div className={classes.insightLabel}>Total Orders</div>
                  <div className={classes.insightValue}>
                    {popularData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                  </div>
                </div>
              </div>
              {userFavData.length > 0 && (
                <div className={classes.insightItem}>
                  <div className={classes.insightIcon}>⚡</div>
                  <div className={classes.insightContent}>
                    <div className={classes.insightLabel}>Your Top Choice</div>
                    <div className={classes.insightValue}>{userFavData[0]?.dish || 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
