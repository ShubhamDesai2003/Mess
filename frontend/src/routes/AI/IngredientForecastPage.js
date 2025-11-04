// src/routes/IngredientForecastPage.js
import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import { FiRefreshCw, FiPackage, FiClock, FiShoppingCart } from "react-icons/fi";
import { motion } from "framer-motion";
import api from "../..";
import classes from "./IngredientForecast.module.css";

export default function IngredientForecastPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortBy, setSortBy] = useState("quantity"); // 'quantity' or 'name'

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
    '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3',
    '#c471f5', '#ffa69e', '#84fab0', '#8fd3f4', '#fbc2eb'
  ];

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.get("api/admin/forecast/ingredients")
      .then(res => {
        const arr = Object.entries(res.data).map(([name, { unit, estimated_quantity }], index) => ({
          key: name,
          name,
          unit,
          quantity: estimated_quantity,
          color: COLORS[index % COLORS.length]
        }));
        setData(arr);
        setLastUpdated(new Date());
      })
      .catch(err => {
        console.error(err);
        setError("Could not load ingredient forecast.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === "quantity") {
      return b.quantity - a.quantity;
    }
    return a.name.localeCompare(b.name);
  });

  const topIngredients = sortedData.slice(0, 5);
  const totalItems = data.length;

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Loading ingredient forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <div className={classes.errorIcon}>⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={fetchData} className={classes.retryButton}>
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={classes.ingredientContainer}>
      {/* Header */}
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <h2 className={classes.pageTitle}>
            <FiPackage className={classes.titleIcon} />
            Ingredient Procurement Plan
          </h2>
          <div className={classes.dateRange}>
            <FiShoppingCart />
            <span>For {nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
        <button 
          onClick={fetchData} 
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
            📦
          </div>
          <div className={classes.metricContent}>
            <div className={classes.metricValue}>{totalItems}</div>
            <div className={classes.metricLabel}>Total Ingredients</div>
          </div>
        </motion.div>

        <motion.div 
          className={classes.metricCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={classes.metricIcon} style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            🥇
          </div>
          <div className={classes.metricContent}>
            <div className={classes.metricValue}>{topIngredients[0]?.name || 'N/A'}</div>
            <div className={classes.metricLabel}>Top Ingredient</div>
          </div>
        </motion.div>

        <motion.div 
          className={classes.metricCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={classes.metricIcon} style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            📊
          </div>
          <div className={classes.metricContent}>
            <div className={classes.metricValue}>{topIngredients[0]?.quantity.toLocaleString() || 0}</div>
            <div className={classes.metricLabel}>Max Quantity</div>
          </div>
        </motion.div>
      </div>

      {/* Sort Controls */}
      <div className={classes.chartControls}>
        <div className={classes.viewToggle}>
          <button 
            className={sortBy === 'quantity' ? classes.active : ''}
            onClick={() => setSortBy('quantity')}
          >
            Sort by Quantity
          </button>
          <button 
            className={sortBy === 'name' ? classes.active : ''}
            onClick={() => setSortBy('name')}
          >
            Sort by Name
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className={classes.chartsGrid}>
        {/* Bar Chart */}
        <motion.div 
          className={classes.chartCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={classes.chartTitle}>Top 10 Ingredients by Quantity</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedData.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#64748b" width={100} />
              <RechartsTooltip 
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name, props) => [
                  `${value.toLocaleString()} ${props.payload.unit}`,
                  'Quantity'
                ]}
              />
              <Bar dataKey="quantity" radius={[0, 8, 8, 0]}>
                {sortedData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Ingredients List */}
        <motion.div 
          className={classes.topCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={classes.chartTitle}>Top 5 Required Items</h3>
          <div className={classes.topList}>
            {topIngredients.map((item, index) => (
              <motion.div 
                key={item.key}
                className={classes.topItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className={classes.topRank} style={{background: item.color}}>
                  {index + 1}
                </div>
                <div className={classes.topInfo}>
                  <div className={classes.topName}>{item.name}</div>
                  <div className={classes.topQuantity}>
                    {item.quantity.toLocaleString()} {item.unit}
                  </div>
                </div>
              </motion.div>
            ))}
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
        <h3 className={classes.chartTitle}>Complete Ingredient List</h3>
        <div className={classes.tableWrapper}>
          <table className={classes.ingredientTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <motion.tr
                  key={row.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.02 }}
                >
                  <td className={classes.indexCell}>{index + 1}</td>
                  <td className={classes.nameCell}>
                    <span className={classes.colorDot} style={{background: row.color}}></span>
                    <strong>{row.name}</strong>
                  </td>
                  <td>
                    <span className={classes.quantityBadge}>
                      {row.quantity.toLocaleString()}
                    </span>
                  </td>
                  <td className={classes.unitCell}>{row.unit}</td>
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

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
}

