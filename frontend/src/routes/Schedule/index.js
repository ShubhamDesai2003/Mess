import React, { useState, useEffect } from "react";
import { Table, message, Card, Row, Col, Typography, Spin, Tabs, Badge, Tag, Divider, Button, Empty } from 'antd';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  FireOutlined, 
  TagOutlined,
  InfoCircleOutlined,
  StarFilled
} from '@ant-design/icons';
import WeekMenu from '../../components/WeekMenu';
import api from '../..';
import classes from './index.module.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Enhanced timing columns with icons
const timingCol = [
    {
        title: <><FireOutlined style={{ marginRight: 8 }} />Meal Type</>,
        dataIndex: 'meal',
        key: 'meal',
        render: (text) => ({
            props: {
                style: { background: "#FAFAFA" },
            },
            children: <span style={{ fontWeight: 600, fontSize: '16px' }}>{text}</span>
        })
    },
    {
        title: <><ClockCircleOutlined style={{ marginRight: 8 }} />Serving Time</>,
        dataIndex: 'time',
        key: 'time',
        render: (text) => <Text strong>{text}</Text>
    }
];

export default function SchedulePage() {
    const mobile = useMediaQuery({ query: '(max-width: 750px)' });
    const tablet = useMediaQuery({ query: '(max-width: 992px) and (min-width: 751px)' });
    const [timingRow, setTimingRow] = useState([]);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(null);
    const [highlightedMeal, setHighlightedMeal] = useState(null);
    
    // Get today's day name
    const getTodayDayName = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Parallel API requests
                const [timeResponse, menuResponse] = await Promise.all([
                    api.get('api/data/time'),
                    api.get('api/data/menu')
                ]);
                
                
                // Format timing data for better display
                const formattedTimingData = timeResponse.data.map(item => ({
                    ...item,
                    key: item.meal.toLowerCase(),
                    // Add meal color codes based on meal type
                    mealColor: item.meal === 'Breakfast' ? '#52c41a' : 
                              item.meal === 'Lunch' ? '#1890ff' : 
                              item.meal === 'Dinner' ? '#722ed1' : '#faad14'
                }));
                
                setTimingRow(formattedTimingData);
                setMenu(menuResponse.data);
                
                // Set active day to today initially
                setActiveDay(getTodayDayName());
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                message.error('Failed to fetch data from server');
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Get today's meals
    const getTodayMenu = () => {
        if (!menu.length || !activeDay) return null;
        
        // Find the day's menu
        const dayMenu = menu.find(item => Object.keys(item).includes(activeDay));
        if (!dayMenu) return null;
        
        return dayMenu[activeDay];
    };

    // Get all available days from menu data in the correct order
    const getDays = () => {
        if (menu.length === 0) return [];
        
        // Define the correct order of days (Monday to Sunday)
        const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Get all keys except "key" to find day names
        const availableDays = [];
        menu.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'key' && !availableDays.includes(key)) {
                    availableDays.push(key);
                }
            });
        });
        
        // Sort the available days according to the defined order
        return availableDays.sort((a, b) => {
            return orderedDays.indexOf(a) - orderedDays.indexOf(b);
        });
    };

    // Highlight meal when user clicks on a meal timing
    const highlightMeal = (meal) => {
        setHighlightedMeal(meal);
        // Auto-scroll to menu section
        document.getElementById('menu-section')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Auto-reset after 3 seconds
        setTimeout(() => {
            setHighlightedMeal(null);
        }, 3000);
    };

    const renderTimingCard = () => {
        return (
            <Card 
                title={
                    <div className={classes.cardTitle}>
                        <ClockCircleOutlined className={classes.cardTitleIcon} />
                        <span>Meal Timings</span>
                    </div>
                }
                className={classes.timingCard}
                bordered={true}
            >
                {timingRow.length > 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <div className={classes.timingsContainer}>
                            {timingRow.map((timing) => (
                                <motion.div 
                                    key={timing.key}
                                    className={classes.timingItem}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => highlightMeal(timing.meal)}
                                >
                                    <div className={classes.mealBadge} style={{ backgroundColor: timing.mealColor }}></div>
                                    <div className={classes.mealInfo}>
                                        <Text strong className={classes.mealName}>{timing.meal}</Text>
                                        <Text className={classes.mealTime}>{timing.time}</Text>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <Empty description="No timing information available" />
                )}
            </Card>
        );
    };

    const renderTodayHighlight = () => {
        const todayMenu = getTodayMenu();
        if (!todayMenu) return null;
        
        return (
            <Card 
                className={classes.todayHighlightCard}
                title={
                    <div className={classes.cardTitle}>
                        <StarFilled className={classes.cardTitleIcon} style={{ color: '#faad14' }} />
                        <span>Today's Special</span>
                    </div>
                }
            >
                <div className={classes.todaySpecials}>
                    {Object.entries(todayMenu).map(([meal, items]) => (
                        <div key={meal} className={classes.todayMeal}>
                            <Tag color={
                                meal === 'Breakfast' ? 'green' : 
                                meal === 'Lunch' ? 'blue' : 
                                meal === 'Dinner' ? 'purple' : 'orange'
                            }>
                                {meal}
                            </Tag>
                            <Text>{items}</Text>
                        </div>
                    ))}
                </div>
            </Card>
        );
    };

    const renderMenuContent = () => {
        return (
            <Card 
                id="menu-section"
                className={classes.menuCard}
                title={
                    <div className={classes.cardTitle}>
                        <TagOutlined className={classes.cardTitleIcon} />
                        <span>Weekly Menu</span>
                    </div>
                }
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeDay}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={classes.weekMenuContainer}
                    >
                        <WeekMenu 
                            menu={menu} 
                            mobile={mobile} 
                            activeDay={activeDay}
                            highlightedMeal={highlightedMeal}
                            getDays={getDays}  // Pass the getDays function to WeekMenu
                        />
                    </motion.div>
                </AnimatePresence>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className={classes.loadingContainer}>
                <Spin size="large" />
                <Text className={classes.loadingText}>Loading menu data...</Text>
            </div>
        );
    }

    // Mobile view with tabs
    if (mobile) {
        return (
            <div className={classes.scheduleContainer}>
                <div className={classes.menuHeader}>
                    <Title level={2} className={classes.mainTitle}>Our Menu</Title>
                    <Text className={classes.subTitleText}>Discover what's cooking this week</Text>
                </div>
                
                {renderTodayHighlight()}
                
                <Tabs 
                    defaultActiveKey="timing"
                    className={classes.mobileTabs}
                >
                    <TabPane tab={<span><ClockCircleOutlined /> Timings</span>} key="timing">
                        {renderTimingCard()}
                    </TabPane>
                    <TabPane tab={<span><TagOutlined /> Weekly Menu</span>} key="menu">
                        {renderMenuContent()}
                    </TabPane>
                </Tabs>
            </div>
        );
    }

    // Desktop/tablet view - side by side tables
    return (
        <div className={classes.scheduleContainer}>
            <div className={classes.menuHeader}>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Title level={2} className={classes.mainTitle}>Our Menu</Title>
                    <Text className={classes.subTitleText}>Discover what's cooking this week</Text>
                </motion.div>
            </div>
            
            {renderTodayHighlight()}
            
            <div className={classes.sideByContainer}>
                <div className={classes.tableCard}>
                    {renderTimingCard()}
                </div>
                <div className={classes.tableCard}>
                    {renderMenuContent()}
                </div>
            </div>
        </div>
    );
}