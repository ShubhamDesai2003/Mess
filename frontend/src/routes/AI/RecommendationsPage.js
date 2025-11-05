
import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { 
  FiStar, FiTrendingUp, FiUser, FiRefreshCw, 
  FiHeart, FiAward, FiThumbsUp 
} from "react-icons/fi";
import { motion } from "framer-motion";
import api from '../..';
import classes from "./Recommendations.module.css";

export default function RecommendationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const COLORS = ['#f17228', '#e06420', '#d55a1f', '#c64f1e', '#ff8c42', '#ffb380', '#ffd6ba', '#ffe5d3'];

  const CACHE_KEY = "ai_recommendations_cache_v2";
  const CACHE_EXPIRY_MINUTES = 15;

  // Check admin only once
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('api/data/status');
        setIsAdmin(res.data?.admin || false);
      } catch (err) {
        console.error("Error checking admin status:", err);
      }
    };
    checkAdmin();
  }, []);

  // Fetch or use cached recommendations
  const fetchRecommendations = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && !forceRefresh) {
        const parsed = JSON.parse(cached);
        const ageMinutes = (Date.now() - parsed.timestamp) / 1000 / 60;
        if (ageMinutes < CACHE_EXPIRY_MINUTES) {
          console.log("✅ Loaded recommendations from cache");
          setData(parsed.data);
          setLoading(false);
          return;
        }
      }

      // Fetch from backend
      const res = await api.get('/api/ai/forecast/recommendations');
      setData(res.data);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: res.data, timestamp: Date.now() })
      );
      console.log("✅ Fresh recommendations fetched and cached");
    } catch (err) {
      console.error("❌ Failed to fetch recommendations:", err);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = () => {
    localStorage.removeItem(CACHE_KEY);
    fetchRecommendations(true);
  };

  // === Conditional UI states ===
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
        <button onClick={handleRefresh} className={classes.retryButton}>
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  // Prepare data for charts
  const popularData = (data.popular || []).slice(0, 8).map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  const userFavData = (data.user || []).slice(0, 5);

  return (
    <div className={classes.recommendContainer}>
      {/* === HERO SECTION === */}
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
            onClick={handleRefresh}
            className={classes.refreshButton}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? classes.spinning : ''} />
            Refresh Data
          </button>
        )}
      </motion.div>

      {/* === TOP TRENDING MEALS === */}
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
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* === ALL POPULAR MEALS === */}
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
                    <FiHeart style={{color: item.color}} /> {item.count} orders
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* === USER FAVORITES === */}
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
    </div>
  );
}

