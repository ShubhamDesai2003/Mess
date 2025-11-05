import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";
import { FiRefreshCw, FiCalendar, FiClock, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import api from "../..";
import classes from "./WeeklyForecast.module.css";

export default function WeeklyForecastPage() {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("Weekly Meal Forecast");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [chartView, setChartView] = useState("bar"); // 'bar' or 'line'

  // ✅ Cache configuration
  const CACHE_KEY = "weekly_forecast_cache_v1";
  const CACHE_EXPIRY_MINUTES = 15;

  const mealColors = {
    breakfast: "#F59E0B",
    lunch: "#10B981",
    dinner: "#6366F1"
  };

  // ✅ Fetch Forecast with Cache Logic
  const fetchForecast = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Check Cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && !forceRefresh) {
        const parsed = JSON.parse(cached);
        const ageMinutes = (Date.now() - parsed.timestamp) / 1000 / 60;

        if (ageMinutes < CACHE_EXPIRY_MINUTES) {
          console.log("✅ Loaded Weekly Forecast from cache");
          setData(parsed.data);
          setTitle(parsed.title);
          setLastUpdated(new Date(parsed.timestamp));
          setLoading(false);
          return;
        } else {
          console.log("⚠️ Cache expired — fetching fresh forecast...");
        }
      }

      // Step 2: Fetch from Backend
      const res = await api.get("api/admin/forecast/weekly");
      const forecastData = res.data;

      const rows = Object.entries(forecastData).map(([day, meals]) => ({
        key: day,
        day: capitalizeFirstLetter(day),
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
        total: meals.breakfast + meals.lunch + meals.dinner
      }));

      // Step 3: Compute date range for title
      const today = new Date();
      const nextMonday = getNextMonday(today);
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);

      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const newTitle = `${formatter.format(nextMonday)} – ${formatter.format(nextSunday)}`;

      // Step 4: Update states and cache
      setData(rows);
      setTitle(newTitle);
      setLastUpdated(new Date());
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: rows,
          title: newTitle,
          timestamp: Date.now()
        })
      );

      console.log("✅ Weekly Forecast fetched & cached successfully");
    } catch (err) {
      console.error("❌ Error fetching Weekly Forecast:", err);
      setError("Could not load weekly meal forecast.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const handleRefresh = () => {
    localStorage.removeItem(CACHE_KEY);
    fetchForecast(true);
  };

  // ✅ Loading & Error States
  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Loading forecast data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <div className={classes.errorIcon}>⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={handleRefresh} className={classes.retryButton}>
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  // ✅ Derived Metrics
  const totalMeals = data.reduce((sum, day) => sum + day.total, 0);
  const avgPerDay = Math.round(totalMeals / data.length);
  const maxDay = data.reduce((max, day) => (day.total > max.total ? day : max), data[0]);

  return (
    <div className={classes.forecastContainer}>
      {/* Header */}
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <h2 className={classes.pageTitle}>
            <FiTrendingUp className={classes.titleIcon} />
            Weekly Meal Demand Forecast
          </h2>
          <div className={classes.dateRange}>
            <FiCalendar />
            <span>{title}</span>
          </div>
        </div>
        <button 
          onClick={handleRefresh} 
          className={classes.refreshButton}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? classes.spinning : ''} />
          Refresh
        </button>
      </div>

      {/* Metrics */}
      <div className={classes.metricsGrid}>
        <MetricCard
          delay={0.1}
          label="Total Meals"
          value={totalMeals.toLocaleString()}
          emoji="📊"
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <MetricCard
          delay={0.2}
          label="Avg Per Day"
          value={avgPerDay.toLocaleString()}
          emoji="📈"
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <MetricCard
          delay={0.3}
          label="Busiest Day"
          value={maxDay?.day}
          emoji="🔥"
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      {/* Chart Toggle */}
      <div className={classes.chartControls}>
        <div className={classes.viewToggle}>
          <button 
            className={chartView === 'bar' ? classes.active : ''}
            onClick={() => setChartView('bar')}
          >
            Bar Chart
          </button>
          <button 
            className={chartView === 'line' ? classes.active : ''}
            onClick={() => setChartView('line')}
          >
            Line Chart
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className={classes.chartsGrid}>  
        <motion.div 
          className={classes.chartCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={classes.chartTitle}>Meal Distribution by Day</h3>
          <ResponsiveContainer width="100%" height={350}>
            {chartView === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="breakfast" fill={mealColors.breakfast} radius={[8, 8, 0, 0]} />
                <Bar dataKey="lunch" fill={mealColors.lunch} radius={[8, 8, 0, 0]} />
                <Bar dataKey="dinner" fill={mealColors.dinner} radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="breakfast" stroke={mealColors.breakfast} strokeWidth={3} />
                <Line type="monotone" dataKey="lunch" stroke={mealColors.lunch} strokeWidth={3} />
                <Line type="monotone" dataKey="dinner" stroke={mealColors.dinner} strokeWidth={3} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Meal Breakdown */}
        <motion.div 
          className={classes.breakdownCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={classes.chartTitle}>Meal Type Breakdown</h3>
          <div className={classes.mealBreakdown}>
            {["breakfast", "lunch", "dinner"].map((meal) => {
              const total = data.reduce((sum, day) => sum + day[meal], 0);
              const percentage = ((total / totalMeals) * 100).toFixed(1);
              return (
                <div key={meal} className={classes.mealItem}>
                  <div className={classes.mealHeader}>
                    <span className={classes.mealName}>
                      <div 
                        className={classes.mealDot} 
                        style={{backgroundColor: mealColors[meal]}}
                      />
                      {capitalizeFirstLetter(meal)}
                    </span>
                    <span className={classes.mealPercentage}>{percentage}%</span>
                  </div>
                  <div className={classes.progressBar}>
                    <motion.div 
                      className={classes.progressFill}
                      style={{backgroundColor: mealColors[meal]}}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                    />
                  </div>
                  <div className={classes.mealTotal}>{total.toLocaleString()} meals</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      {lastUpdated && (
        <div className={classes.footer}>
          <FiClock />
          <span>Last updated: {formatDate(lastUpdated)}</span>
        </div>
      )}
    </div>
  );
}

// 🔹 Reusable Metric Card
function MetricCard({ delay, label, value, emoji, gradient }) {
  return (
    <motion.div 
      className={classes.metricCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className={classes.metricIcon} style={{background: gradient}}>
        {emoji}
      </div>
      <div className={classes.metricContent}>
        <div className={classes.metricValue}>{value}</div>
        <div className={classes.metricLabel}>{label}</div>
      </div>
    </motion.div>
  );
}

// 🔹 Helper Functions
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
