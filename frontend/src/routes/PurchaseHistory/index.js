// import classes from './index.module.css';
// import { Button, Space, message } from 'antd';
// import { useMediaQuery } from 'react-responsive';
// import WeekMenu from '../../components/WeekMenu';
// import { useState, useEffect } from "react";
// import api from '../..';

// export default function PurchaseHistoryPage() {
//     const mobile = useMediaQuery({ query: '(max-width: 750px)' });
//     const [thisweek, setThisWeek] = useState(true);
//     const [menu, setMenu] = useState([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         console.log("Purchase History!!");
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const [menuResponse, buyerResponse] = await Promise.all([
//                     api.get('api/data/menu'),
//                     api.get('api/user/data')
//                 ]);

//                 console.log("purchase History:", menuResponse, buyerResponse)

//                 const formattedData = menuResponse.data.map(r => ({
//                     day: r.day,
//                     breakfast: { 
//                         text: r.breakfast, 
//                         selected: buyerResponse.data[thisweek ? "this" : "next"][r.day].breakfast 
//                     },
//                     lunch: { 
//                         text: r.lunch, 
//                         selected: buyerResponse.data[thisweek ? "this" : "next"][r.day].lunch 
//                     },
//                     dinner: { 
//                         text: r.dinner, 
//                         selected: buyerResponse.data[thisweek ? "this" : "next"][r.day].dinner 
//                     }
//                 }));

//                 setMenu(formattedData);
//             } catch (error) {
//                 message.error('Failed to fetch purchase history');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [thisweek]);

//     return (
//         <div className={classes.menuBody}>
//             <div className={classes.buttons}>
//                 <Space>
//                     <Button 
//                         disabled={!thisweek} 
//                         type='primary' 
//                         size='large' 
//                         onClick={() => setThisWeek(true)}
//                     >
//                         This Week
//                     </Button>
//                     {/* <Button 
//                         disabled={!thisweek} 
//                         type='primary' 
//                         size='large' 
//                         onClick={() => setThisWeek(false)}
//                     >
//                         Next Week
//                     </Button> */}
//                 </Space>
//             </div>
//             <h1>{thisweek ? "Your Coupons This Week" : "Your Coupons Next Week"}</h1>
//             <WeekMenu loading={loading} menu={menu} mobile={mobile} highlight />
//         </div>
//     );
// }









import React, { useState, useEffect } from "react";
import { Card, Row, Col, message } from "antd";
import api from "../../index";
import MealRatingCard from "./MealRatingCard";

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
