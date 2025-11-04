import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WeeklyForecastPage from "./WeeklyForecastPage";
import IngredientForecastPage from "./IngredientForecastPage";
import RecommendationsPage from "./RecommendationsPage";
import { 
  FiTrendingUp, 
  FiPackage, 
  FiStar,
  FiBarChart2,
  FiPieChart,
  FiActivity
} from "react-icons/fi";
import api from "../..";
import classes from "./ForecastDashboard.module.css";

export default function ForecastDashboard() {
  const [activeTab, setActiveTab] = useState("recommendations"); // Start with recommendations for users
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await api.get('api/data/status');
        setIsAdmin(response.data?.admin || false);
        // If admin, default to weekly forecast, else recommendations
        if (response.data?.admin) {
          setActiveTab("weekly");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    checkAdmin();
  }, []);

  const tabs = [
    { 
      id: "recommendations", 
      label: "Meal Recommendations", 
      icon: <FiStar />,
      color: "#f17228",
      description: "Discover trending and personalized meals",
      userFacing: true // Available to all users
    },
    { 
      id: "weekly", 
      label: "Demand Forecast", 
      icon: <FiTrendingUp />,
      color: "#e06420",
      description: "Predict meal demand for upcoming week",
      userFacing: false // Admin only
    },
    { 
      id: "ingredients", 
      label: "Ingredient Planning", 
      icon: <FiPackage />,
      color: "#d55a1f",
      description: "Optimize ingredient procurement",
      userFacing: false // Admin only
    },
  ];

  // Filter tabs based on admin status
  const visibleTabs = isAdmin ? tabs : tabs.filter(tab => tab.userFacing);

  const renderContent = () => {
    switch (activeTab) {
      case "weekly":
        return <WeeklyForecastPage />;
      case "ingredients":
        return <IngredientForecastPage />;
      case "recommendations":
        return <RecommendationsPage />;
      default:
        return <RecommendationsPage />;
    }
  };

  return (
    <div className={classes.dashboardContainer}>
      {/* Header Section */}
      <motion.div 
        className={classes.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={classes.headerContent}>
          <div className={classes.titleSection}>
            <FiActivity className={classes.headerIcon} />
            <div>
              <h1 className={classes.mainTitle}>
                {isAdmin ? "AI-Powered Analytics" : "Smart Meal Recommendations"}
              </h1>
              <p className={classes.subtitle}>
                {isAdmin 
                  ? "Intelligent forecasting for optimal mess management" 
                  : "Discover trending and personalized meal options"}
              </p>
            </div>
          </div>
          
          {isAdmin && (
            <div className={classes.statsOverview}>
              <div className={classes.statCard}>
                <FiBarChart2 className={classes.statIcon} style={{color: '#f17228'}} />
                <div>
                  <div className={classes.statValue}>95%</div>
                  <div className={classes.statLabel}>Accuracy</div>
                </div>
              </div>
              <div className={classes.statCard}>
                <FiPieChart className={classes.statIcon} style={{color: '#e06420'}} />
                <div>
                  <div className={classes.statValue}>3</div>
                  <div className={classes.statLabel}>AI Models</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tab Navigation - Only show if more than one tab */}
      {visibleTabs.length > 1 && (
        <motion.div 
          className={classes.tabContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={classes.tabWrapper}>
            {visibleTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                className={`${classes.tab} ${activeTab === tab.id ? classes.activeTab : ''}`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  '--tab-color': tab.color
                }}
              >
                <span className={classes.tabIcon}>{tab.icon}</span>
                <div className={classes.tabContent}>
                  <span className={classes.tabLabel}>{tab.label}</span>
                  <span className={classes.tabDescription}>{tab.description}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div 
                    className={classes.activeIndicator}
                    layoutId="activeTab"
                    style={{ backgroundColor: tab.color }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Content Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={classes.contentWrapper}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
