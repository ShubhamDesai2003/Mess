import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell 
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

  const mealColors = {
    breakfast: "#F59E0B",
    lunch: "#10B981",
    dinner: "#6366F1"
  };

  const fetchForecast = async () => {
    setLoading(true);
    try {
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

      setData(rows);

      // Dynamically set title: e.g. Aug 5 – Aug 11, 2025
      const today = new Date();
      const nextMonday = getNextMonday(today);
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);

      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      setTitle(`${formatter.format(nextMonday)} – ${formatter.format(nextSunday)}`);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not load weekly meal forecast.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

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
        <button onClick={fetchForecast} className={classes.retryButton}>
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  const totalMeals = data.reduce((sum, day) => sum + day.total, 0);
  const avgPerDay = Math.round(totalMeals / data.length);
  const maxDay = data.reduce((max, day) => day.total > max.total ? day : max, data[0]);

  return (
    <div className={classes.forecastContainer}>
      {/* Header with Stats */}
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
          onClick={fetchForecast} 
          className={classes.refreshButton}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? classes.spinning : ''} />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className={classes.metricsGrid}>
        <motion.div 
          className={classes.metricCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={classes.metricIcon} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            📊
          </div>
          <div className={classes.metricContent}>
            <div className={classes.metricValue}>{totalMeals.toLocaleString()}</div>
            <div className={classes.metricLabel}>Total Meals</div>
          </div>
        </motion.div>

        <motion.div 
          className={classes.metricCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={classes.metricIcon} style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            📈
          </div>
          <div className={classes.metricContent}>
            <div className={classes.metricValue}>{avgPerDay.toLocaleString()}</div>
            <div className={classes.metricLabel}>Avg Per Day</div>
          </div>
        </motion.div>

        <motion.div 
          className={classes.metricCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={classes.metricIcon} style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            🔥
          </div>
          <div className={classes.metricContent}>
            <div className={classes.metricValue}>{maxDay?.day}</div>
            <div className={classes.metricLabel}>Busiest Day</div>
          </div>
        </motion.div>
      </div>

      {/* Chart View Toggle */}
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

      {/* Charts Section */}
      <div className={classes.chartsGrid}>
        {/* Main Chart */}
        <motion.div 
          className={classes.chartCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={classes.chartTitle}>Meal Distribution by Day</h3>
          <ResponsiveContainer width="100%" height={350}>
            {chartView === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <RechartsTooltip 
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
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
                <RechartsTooltip 
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
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
            {['breakfast', 'lunch', 'dinner'].map((meal) => {
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

      {/* Detailed Table */}
      <motion.div 
        className={classes.tableCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className={classes.chartTitle}>Detailed Forecast</h3>
        <div className={classes.tableWrapper}>
          <table className={classes.forecastTable}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <motion.tr
                  key={row.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  <td className={classes.dayCell}>
                    <strong>{row.day}</strong>
                  </td>
                  <td>
                    <span className={classes.mealBadge} style={{background: `${mealColors.breakfast}20`, color: mealColors.breakfast}}>
                      {row.breakfast.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={classes.mealBadge} style={{background: `${mealColors.lunch}20`, color: mealColors.lunch}}>
                      {row.lunch.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={classes.mealBadge} style={{background: `${mealColors.dinner}20`, color: mealColors.dinner}}>
                      {row.dinner.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <strong className={classes.totalCell}>{row.total.toLocaleString()}</strong>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

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

// Helper Functions
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
