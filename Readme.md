CampusBite 🍽️
An AI-Powered Mess Management System with Personalized Meal Recommendations, Inventory Forecasting, and Dynamic QR Codes
🚀 Features

✅ Core Features (Existing System)
- 📅 Weekly Menu Display – View and manage breakfast, lunch, and dinner schedules.
- 🎫 Digital Meal Coupons – Users select meals and purchase digital coupons via Razorpay.
- 🔐 Google OAuth Authentication – Secure login with session-based access control.
- 📲 QR Code Generation & Scanning – Dynamic, per-user QR codes for meal access validation.
- 🧑💼 Admin Panel – Manage menus, pricing, and view booked meals by day/meal.
- 🔄 Real-time Updates – Auth and menu data sync dynamically between client and server.

🛠️ Tech Stack

🖥️ Frontend:
- React.js
- Ant Design (UI library)
- React Router v6
- Axios for API calls
- Framer Motion for animations

🖥️ Backend:
- Node.js + Express.js
- MongoDB with Mongoose ODM
- Passport.js (Google OAuth)
- Razorpay SDK for payments
- connect-mongo for session storage

📁 Folder Structure

/client → React frontend app
  └── /routes → Pages (BuyPage, HomePage, AdminPanel, etc.)
  └── /components → Reusable components (MealCard, QRCodeCard, etc.)

/server
  └── /models → Mongoose models (User, Buyer, Menu, Order, Time)
  └── /routes → Express routes (auth, admin, user, data)
  └── /config → DB and passport configuration
  └── index.js → Entry point for Express app

📦 Installation & Setup

1. Clone the repository
git clone https://github.com/yourusername/campusbite.git
cd campusbite

2. Install backend dependencies
cd server
npm install

3. Install frontend dependencies
cd ../client
npm install

4. Environment Configuration
Create a .env file in the /server folder with the following:
MONGO_URI=your_mongodb_connection_string
PORT=4000
FRONTEND=http://localhost:3000
ADMIN=admin@example.com
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

5. Run the servers
# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm start

🤖 Upcoming AI Modules
1️⃣ Meal & Ingredient Forecasting (Admin Panel)

Purpose: Predict next week’s meal counts and ingredient requirements to reduce waste and optimize procurement.

- Uses time-series models (e.g., Prophet or LSTM)
- Trains on historical WeeklySelections stored in MongoDB
- Exposes /api/admin/forecast endpoint
- Results shown as charts/tables in the admin panel

2️⃣ Personalized Meal Recommendations (User Side)

Purpose: Suggest meals to users based on past selections and ingredient preferences.

- Uses content-based filtering
- Learns from userSelections (stored on order completion)
- API: /api/user/recommendations
- Recommendations are highlighted on the BuyPage with badges or tooltips

📊 AI Tools & Libraries (Planned)

- Prophet – Time-series forecasting (Python)
- Scikit-learn – For recommendation engine
- Pandas & NumPy – Data processing
- Python-Shell – To integrate Python models with Node.js backend
- Chart.js or Recharts – For admin-side visualizations

📈 Future Enhancements

- User Feedback on Recommended Meals (thumbs up/down)
- Mobile App Integration (React Native or Flutter)
- Admin Analytics: Forecast vs Actual Meals
- Multi-Mess & Vendor Support
- SMS/Email Notifications for Meal Reminders

👥 Authors

- Shubham Desai 
- Vishakha Desale
- Kalyani Phad 


