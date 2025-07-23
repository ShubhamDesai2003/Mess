import { useState, useEffect } from 'react';
import { Button, message, Card, Checkbox, Badge, Spin, Typography, Tabs, Tooltip, Empty } from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined, InfoCircleOutlined, CalendarOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import api from '../..';
import classes from './index.module.css';
import UPIPayment from '../../components/UPI';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const dayToNum = {
    "monday": 0, "tuesday": 1, "wednesday": 2,
    "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6
};

// Helper function to capitalize first letter
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

// Custom icon for meal types
const MealIcon = ({ type }) => {
    const icons = {
        breakfast: '🍳',
        lunch: '🍲',
        dinner: '🍽️'
    };
    return <span className={classes.mealIcon}>{icons[type]}</span>;
};

export async function createOrder(selected) {
    try {
        const response = await api.post('api/user/createOrder', { selected });
        return response.data;
    } catch (error) {
        message.error('Failed to create order');
        throw error;
    }
}

function MealCard({ dayData, selected, setSelected, loading, alreadyPurchased }) {
    // Add safety check to prevent rendering errors
    if (!dayData || !dayData.day || !selected[dayData.day]) {
        return null;
    }

    const handleMealSelection = (meal, checked) => {
        // If meal is already purchased, prevent selection
        if (alreadyPurchased[dayData.day]?.[meal]) {
            return;
        }

        setSelected(prev => ({
            ...prev,
            [dayData.day]: {
                ...prev[dayData.day],
                [meal]: checked
            }
        }));
    };

    const getMealTime = (meal) => {
        const times = {
            breakfast: '08:00 AM',
            lunch: '01:00 PM',
            dinner: '08:00 PM'
        };
        return times[meal];
    };

    return (
        <Card 
            className={classes.dayCard}
            bordered={true}
            title={
                <div className={classes.dayHeader}>
                    <CalendarOutlined className={classes.calendarIcon} />
                    <span>{capitalize(dayData.day)}</span>
                </div>
            }
            headStyle={{ backgroundColor: '#f9f9f9' }}
            bodyStyle={{ padding: '12px' }}
        >
            <Spin spinning={loading}>
                {['breakfast', 'lunch', 'dinner'].map(meal => {
                    const isPurchased = alreadyPurchased[dayData.day]?.[meal];

                    return (
                    <motion.div 
                        key={meal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: ['breakfast', 'lunch', 'dinner'].indexOf(meal) * 0.1 }}
                    >
                        <Card 
                            className={`${classes.mealItem} 
                                      ${selected[dayData.day][meal] ? classes.selectedMeal : ''} 
                                      ${isPurchased ? classes.purchasedMeal : ''}`}
                            size="small"
                            hoverable={!isPurchased}
                            onClick={() => handleMealSelection(meal, !selected[dayData.day][meal])}
                        >
                            <div className={classes.mealHeader}>
                                <div className={classes.mealTitleBlock}>
                                    <MealIcon type={meal} />
                                    <Text strong className={classes.mealType}>{capitalize(meal)}</Text>
                                    <Text type="secondary" className={classes.mealTime}>
                                        {getMealTime(meal)}
                                    </Text>
                                    {isPurchased && (
                                        <Badge 
                                            count={<LockOutlined style={{ color: '#fff' }} />}
                                            style={{ backgroundColor: '#52c41a' }}
                                            className={classes.purchasedBadge}
                                        />
                                    )}
                                </div>
                                <Badge 
                                    count={`₹${dayData[meal]?.cost || 0}`} 
                                    className={classes.priceBadge}
                                    style={{ backgroundColor: isPurchased ? '#7cb305' : '#ff7f50' }}
                                />
                            </div>

                            <div className={classes.menuText}>
                                {dayData[meal]?.text || <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Menu not available" />}
                            </div>

                            <div className={classes.mealFooter}>
                                {isPurchased ? (
                                    <div className={classes.alreadyPurchased}>
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                        <Text className={classes.purchasedText}>Already Purchased </Text>
                                    </div>
                                ) : (
                                    <Checkbox 
                                        checked={selected[dayData.day][meal]}
                                        onChange={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMealSelection(meal, !selected[dayData.day][meal]);
                                        }}
                                        className={classes.mealCheckbox}
                                        disabled={isPurchased}
                                    >
                                        Select
                                    </Checkbox>
                                )}

                                <Tooltip title={isPurchased ? "Already purchased" : "Click to select this meal"}>
                                    {isPurchased ? 
                                        <CheckCircleOutlined className={classes.infoIcon} style={{ color: '#52c41a' }} /> : 
                                        <InfoCircleOutlined className={classes.infoIcon} />
                                    }
                                </Tooltip>
                            </div>
                        </Card>
                    </motion.div>
                    );
                })}
            </Spin>
        </Card>
    );


    // return (
    //     <Card
    //         className={classes.dayCard}
    //         bordered={true}
    //         title={
    //             <div className={classes.dayHeader}>
    //                 <CalendarOutlined className={classes.calendarIcon} />
    //                 <span>{capitalize(dayData.day)}</span>
    //             </div>
    //         }
    //         headStyle={{ backgroundColor: '#f9f9f9' }}
    //         bodyStyle={{ padding: '12px' }}
    //     >
    //         <Spin spinning={loading}>
    //             {['breakfast', 'lunch', 'dinner'].map(meal => {
    //                 const isPurchased = alreadyPurchased[dayData.day]?.[meal];

    //                 // Hide the meal card if purchased
    //                 if (isPurchased) {
    //                     return null;
    //                 }

    //                 return (
    //                     <motion.div
    //                         key={meal}
    //                         initial={{ opacity: 0 }}
    //                         animate={{ opacity: 1 }}
    //                         transition={{ duration: 0.3, delay: ['breakfast', 'lunch', 'dinner'].indexOf(meal) * 0.1 }}
    //                     >
    //                         <Card
    //                             className={`${classes.mealItem} ${selected[dayData.day][meal] ? classes.selectedMeal : ''}`}
    //                             size="small"
    //                             hoverable
    //                             onClick={() => handleMealSelection(meal, !selected[dayData.day][meal])}
    //                         >
    //                             <div className={classes.mealHeader}>
    //                                 <div className={classes.mealTitleBlock}>
    //                                     <MealIcon type={meal} />
    //                                     <Text strong className={classes.mealType}>{capitalize(meal)}</Text>
    //                                     <Text type="secondary" className={classes.mealTime}>
    //                                         {getMealTime(meal)}
    //                                     </Text>
    //                                 </div>
    //                                 <Badge
    //                                     count={`₹${dayData[meal]?.cost || 0}`}
    //                                     className={classes.priceBadge}
    //                                     style={{ backgroundColor: '#ff7f50' }}
    //                                 />
    //                             </div>

    //                             <div className={classes.menuText}>
    //                                 {dayData[meal]?.text || <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Menu not available" />}
    //                             </div>

    //                             <div className={classes.mealFooter}>
    //                                 <Checkbox
    //                                     checked={selected[dayData.day][meal]}
    //                                     onChange={(e) => e.stopPropagation()}
    //                                     onClick={(e) => {
    //                                         e.stopPropagation();
    //                                         handleMealSelection(meal, !selected[dayData.day][meal]);
    //                                     }}
    //                                     className={classes.mealCheckbox}
    //                                 >
    //                                     Select
    //                                 </Checkbox>
    //                                 <Tooltip title="Click to select this meal">
    //                                     <InfoCircleOutlined className={classes.infoIcon} />
    //                                 </Tooltip>
    //                             </div>
    //                         </Card>
    //                     </motion.div>
    //                 );
    //             })}
    //         </Spin>
    //     </Card>
    // );
}

function OrderSummary({ selected, loading, cost, setBought, menu, alreadyPurchased }) {
    const totalMeals = Object.values(selected).reduce((acc, dayMeals) =>
        acc + Object.values(dayMeals).filter(Boolean).length, 0);

    const selectedMealsList = [];
    Object.entries(selected).forEach(([day, meals]) => {
        Object.entries(meals).forEach(([meal, isSelected]) => {
            if (isSelected && dayToNum[day] !== undefined && menu[dayToNum[day]] && menu[dayToNum[day]][meal]) {
                selectedMealsList.push({
                    day: capitalize(day),
                    meal: capitalize(meal),
                    cost: menu[dayToNum[day]][meal].cost || 0
                });
            }
        });
    });

    // const handlePayment = async () => {
    //     try {
    //         // Create combinedSelected by merging alreadyPurchased and selected
    //         const combinedSelected = {};
    //         Object.keys(selected).forEach(day => {
    //             combinedSelected[day] = {};
    //             ['breakfast', 'lunch', 'dinner'].forEach(meal => {
    //                 // Include meal if it's already purchased or newly selected
    //                 combinedSelected[day][meal] = alreadyPurchased[day]?.[meal] || selected[day][meal];
    //             });
    //         });
    //         <UPIPayment/>
    //         await createOrder(combinedSelected);
    //         message.success("Order created successfully!");
    //         setBought(true);
    //         window.location.href = '/buy-coupons';  
    //         // window.location.replace('/buy-coupons')
    //     } catch (error) {
    //         message.error("Failed to create order");
    //     }
    // };

    const [TotalLocal, setTotalLocal] = useState();
    const handlePayment = async () => {

        try {
            // Create combinedSelected by merging alreadyPurchased and selected
            const combinedSelected = {};
            Object.keys(selected).forEach(day => {
                combinedSelected[day] = {};
                ['breakfast', 'lunch', 'dinner'].forEach(meal => {
                    // Include meal if it's already purchased or newly selected
                    combinedSelected[day][meal] = alreadyPurchased[day]?.[meal] || selected[day][meal];
                });
            });
            // Store the combined selection in localStorage
            localStorage.setItem('pendingOrder', JSON.stringify(combinedSelected));
            localStorage.setItem('cost', JSON.stringify(TotalLocal));
            // Navigate to the UPI payment page
            window.location.href = '/upi-payment';
        } catch (error) {
            message.error("Failed to initiate payment");
        }
    };

    useEffect(() => {
        setTotalLocal(cost);
    }, [cost]);

    return (
        <Card className={classes.summaryCard}>
            <div className={classes.summaryHeader}>
                <Title level={4}>Order Summary</Title>
                <Badge
                    count={totalMeals}
                    showZero
                    overflowCount={99}
                    style={{ backgroundColor: totalMeals ? '#52c41a' : '#d9d9d9' }}
                >
                    <Text>Selected Meals</Text>
                </Badge>
            </div>

            <div className={classes.mealSummaryList}>
                {selectedMealsList.length > 0 ? (
                    selectedMealsList.map((item, index) => (
                        <div key={index} className={classes.summaryItem}>
                            <Text>{item.day} - {item.meal}</Text>
                            <Text type="secondary">₹{item.cost}</Text>
                        </div>
                    ))
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No meals selected yet"
                        className={classes.emptySelection}
                    />
                )}
            </div>

            <div className={classes.summaryFooter}>
                <div className={classes.totalCost}>
                    <Text strong>Total Cost:</Text>
                    <Title level={3} className={classes.costAmount}>₹{cost}</Title>
                </div>

                <Button
                    disabled={loading || !cost}
                    onClick={handlePayment}
                    className={classes.buyButton}
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                >
                    Confirm Order
                </Button>
            </div>
        </Card>
    );
}

export default function BuyPage() {
    const [cost, setCost] = useState(0);
    const [loading, setLoading] = useState(true);
    const [bought, setBought] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const isSmallScreen = useMediaQuery({ maxWidth: 768 });

    const [menu, setMenu] = useState([]);
    const [selected, setSelected] = useState({});
    // New state to track already purchased meals
    const [alreadyPurchased, setAlreadyPurchased] = useState({});

    // Initialize menu and selected states
    useEffect(() => {
        // Initialize menu with empty data for all days
        const initialMenu = Array(7).fill().map((_, i) => ({
            day: Object.keys(dayToNum)[i],
            breakfast: { text: "", cost: 0 },
            lunch: { text: "", cost: 0 },
            dinner: { text: "", cost: 0 },
        }));

        // Initialize selected state for all days
        const initialSelected = Object.fromEntries(
            Object.keys(dayToNum).map(day => [
                day, { breakfast: false, lunch: false, dinner: false }
            ])
        );

        setMenu(initialMenu);
        setSelected(initialSelected);
    }, []);

    // Calculate cost when selection changes
    useEffect(() => {
        const totalCost = Object.entries(selected).reduce((acc, [day, meals]) => {
            const dayIndex = dayToNum[day];
            const dayData = menu[dayIndex];

            if (!dayData) return acc;

            return acc + Object.entries(meals).reduce((dayAcc, [meal, isSelected]) => {
                if (!isSelected || !dayData[meal]) return dayAcc;
                return dayAcc + (parseInt(dayData[meal].cost) || 0);
            }, 0);
        }, 0);

        setCost(totalCost);
    }, [menu, selected]);

    // Fetch menu and prices
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menuRes, pricesRes] = await Promise.all([
                    api.get('api/data/menu'),
                    api.get('api/data/time')
                ]);

                const mealPrices = pricesRes.data.reduce((acc, { meal, cost }) =>
                    ({ ...acc, [meal]: cost }), {});

                // Process the menu data and handle "Saturdayday" typo
                const processedMenuData = menuRes.data.map(day => {
                    // Fix for "Saturdayday" typo
                    // const dayName = day.day === "Saturday" ? "saturday" : day.day.toLowerCase();
                    const dayName = (day.day || "").toLowerCase();


                    return {
                        ...day,
                        day: dayName,
                        breakfast: { text: day.breakfast, cost: mealPrices.breakfast || 0 },
                        lunch: { text: day.lunch, cost: mealPrices.lunch || 0 },
                        dinner: { text: day.dinner, cost: mealPrices.dinner || 0 }
                    };
                });

                // Create a new menu array with the correct structure
                const updatedMenu = Array(7).fill().map((_, i) => {
                    const dayName = Object.keys(dayToNum)[i];
                    const dayData = processedMenuData.find(d => d.day === dayName);

                    if (dayData) {
                        return dayData;
                    }

                    // Return default data for missing days
                    return {
                        day: dayName,
                        breakfast: { text: "", cost: mealPrices.breakfast || 0 },
                        lunch: { text: "", cost: mealPrices.lunch || 0 },
                        dinner: { text: "", cost: mealPrices.dinner || 0 }
                    };
                });

                setMenu(updatedMenu);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                message.error('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Check existing orders and fetch already purchased meals
    useEffect(() => {
        Promise.all([
            api.get('api/user/boughtNextWeek'),
            api.get('api/user/data') // Get already purchased meals data
        ])
            .then(([boughtRes, userData]) => {
                setBought(boughtRes.data);

                // Process user data to get already purchased meals
                const thisWeekData = userData.data?.this || {};

                // Create a normalized structure for already purchased meals
                const purchasedMeals = {};

                Object.entries(thisWeekData).forEach(([day, meals]) => {
                    // Normalize day name (handle potential typos)
                    const normalizedDay = day.toLowerCase().replace('saturdayday', 'saturday');

                    purchasedMeals[normalizedDay] = {
                        breakfast: !!meals.breakfast,
                        lunch: !!meals.lunch,
                        dinner: !!meals.dinner
                    };
                });

                setAlreadyPurchased(purchasedMeals);

                // Remove already purchased meals from selection
                setSelected(prev => {
                    const newSelected = { ...prev };

                    Object.entries(purchasedMeals).forEach(([day, meals]) => {
                        if (newSelected[day]) {
                            Object.entries(meals).forEach(([meal, isPurchased]) => {
                                if (isPurchased) {
                                    newSelected[day][meal] = false;
                                }
                            });
                        }
                    });

                    return newSelected;
                });
            })
            .catch(() => {
                message.error('Failed to check existing orders');
            });
    }, []);

    // Filter days based on active tab
    const getFilteredDays = () => {
        if (activeTab === 'all') return menu;
        if (activeTab === 'weekdays')
            return menu.filter(day => day && ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.day));
        if (activeTab === 'weekend')
            return menu.filter(day => day && ['saturday', 'sunday'].includes(day.day));
        return menu;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.headerSection}>
                <Title level={2}>Weekly Meal Planner</Title>
                <Text type="secondary">Choose your meals for the upcoming week</Text>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className={classes.menuTabs}
                type="card"
            >
                <TabPane tab="All Days" key="all" />
                <TabPane tab="Weekdays" key="weekdays" />
                <TabPane tab="Weekend" key="weekend" />
            </Tabs>

            <div className={classes.menuLayout}>
                <div className={classes.menuContainer}>
                    {getFilteredDays().filter(dayData => dayData && dayData.day).map((dayData) => (
                        <MealCard
                            key={dayData.day}
                            dayData={dayData}
                            selected={selected}
                            setSelected={setSelected}
                            loading={loading}
                            alreadyPurchased={alreadyPurchased} // Pass already purchased meals
                        />
                    ))}
                </div>

                <div className={classes.orderSummaryContainer}>
                    <OrderSummary
                        selected={selected}
                        loading={loading}
                        cost={cost}
                        setBought={setBought}
                        menu={menu}
                        alreadyPurchased={alreadyPurchased} // Pass already purchased meals
                    />
                </div>
            </div>
        </div>
    );
}