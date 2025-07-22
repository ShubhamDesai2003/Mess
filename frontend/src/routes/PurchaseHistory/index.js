// import { Spin, Card, message } from 'antd';
// import { useMediaQuery } from 'react-responsive';
// import { useState, useEffect } from "react";
// import { CheckCircleFilled, CalendarOutlined } from '@ant-design/icons';
// import api from '../..';
// import styles from './index.module.css';

// export default function PurchaseHistoryPage() {
//   const isMobile = useMediaQuery({ query: '(max-width: 750px)' });
//   const [activeWeek, setActiveWeek] = useState("this");
//   const [menu, setMenu] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Define normalized day mapping
//   const dayMapping = {
//     "monday": "Monday",
//     "tuesday": "Tuesday", 
//     "wednesday": "Wednesday",
//     "thursday": "Thursday",
//     "friday": "Friday",
//     "saturday": "Saturday",
//     "sunday": "Sunday",
//     // Handle potential typo from API
//     "saturdayday": "Saturday"
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [menuResponse, buyerResponse] = await Promise.all([
//           api.get('api/data/menu'),
//           api.get('api/user/data')
//         ]);

//         const buyerWeekData = buyerResponse.data?.[activeWeek] || {};

//         // Process menu data with normalized day names
//         const formattedData = menuResponse.data.map(r => {
//           // Normalize the day name to lowercase for consistent comparison
//           const normalizedDay = r.day.toLowerCase().replace('saturdayday', 'saturday');
          
//           // Get buyer data using the normalized day name
//           const buyerDayData = buyerWeekData?.[normalizedDay] || 
//                                buyerWeekData?.[r.day] || {};
          
//           return {
//             day: normalizedDay,
//             displayDay: dayMapping[normalizedDay] || normalizedDay,
//             breakfast: {
//               text: r.breakfast,
//               selected: buyerDayData.breakfast || false
//             },
//             lunch: {
//               text: r.lunch,
//               selected: buyerDayData.lunch || false
//             },
//             dinner: {
//               text: r.dinner,
//               selected: buyerDayData.dinner || false
//             }
//           };
//         });

//         setMenu(formattedData);
//       } catch (error) {
//         console.error("Fetch error:", error);
//         message.error('Failed to fetch purchase history');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [activeWeek]);

//   const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
//   const mealTypes = ["breakfast", "lunch", "dinner"];
//   const mealLabels = {
//     breakfast: "Breakfast",
//     lunch: "Lunch",
//     dinner: "Dinner"
//   };

//   const getMealCount = () => {
//     return menu.reduce((count, day) => {
//       mealTypes.forEach(mealType => {
//         if (day[mealType]?.selected) count++;
//       });
//       return count;
//     }, 0);
//   };

//   return (
//     <div className={styles.purchaseHistoryContainer}>
//       <div className={styles.headerSection}>
//         <h1 className={styles.pageTitle}>
//           <span className={styles.iconWrapper}>
//             <CalendarOutlined />
//           </span>
//           Your Meal Plan
//         </h1>
//         <div className={styles.mealStats}>
//           <span>Selected Meals: {getMealCount()}</span>
//         </div>
//       </div>

//       {loading ? (
//         <div className={styles.loadingContainer}>
//           <Spin size="large" />
//         </div>
//       ) : (
//         <div className={styles.mealCardsContainer}>
//           {days.map(day => {
//             // Find day data using normalized day name
//             const dayData = menu.find(d => d.day === day);
//             if (!dayData) {
//               console.log(`No data found for ${day}`);
//               return null;
//             }

//             return (
//               <Card
//                 key={day}
//                 title={dayData.displayDay || day.charAt(0).toUpperCase() + day.slice(1)}
//                 className={styles.dayCard}
//                 headStyle={{ backgroundColor: '#f7f7f7' }}
//               >
//                 {mealTypes.map(mealType => (
//                   <div
//                     key={mealType}
//                     className={`${styles.mealItem} ${dayData[mealType].selected ? styles.selectedMeal : ''}`}
//                   >
//                     <div className={styles.mealHeader}>
//                       {dayData[mealType].selected && (
//                         <CheckCircleFilled className={styles.checkIcon} />
//                       )}
//                       <h3 className={styles.mealTitle}>{mealLabels[mealType]}</h3>
//                     </div>
//                     <p className={styles.mealText}>{dayData[mealType].text || "No menu available"}</p>
//                   </div>
//                 ))}
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }


// src/routes/PurchaseHistoryPage.js
import React, { useState, useEffect } from "react";
import { Card, Row, Col, message } from "antd";
import api from "../../index";
import MealRatingCard from "../PurchaseHistory/MealRatingCard";

export default function PurchaseHistoryPage() {
  const [activeWeek, setActiveWeek] = useState("this");
  const [purchaseData, setPurchaseData] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/api/data/menu"),
      api.get("/api/user/data")
    ])
      .then(([menuRes, userRes]) => {
        setMenu(menuRes.data);
        setPurchaseData(userRes.data);
      })
      .catch(() => message.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, [activeWeek]);

  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Row gutter={[16, 16]}>
        {days.map(day => {
          const dayMenu = menu.find(m => m.day === day);
          const userWeekData = purchaseData[activeWeek] || {};
          const userMeals = userWeekData[day] || {};

          return (
            <Col span={8} key={day}>
              <Card title={day.charAt(0).toUpperCase() + day.slice(1)}>
                {['breakfast','lunch','dinner'].map(mealType => {
                  const consumed = userMeals[mealType];
                  if (!consumed) {
                    return (
                      <div key={mealType}>
                        <b>{mealType}</b>: Not selected
                      </div>
                    );
                  }

                  return (
                    <div key={mealType} style={{ marginBottom: 12 }}>
                      <b>{mealType}</b>
                      <MealRatingCard day={day} mealType={mealType} />
                    </div>
                  );
                })}
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}
