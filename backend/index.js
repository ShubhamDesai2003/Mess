// Import required modules
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Initialize express app
let app = express();

// Load env and set PORT
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 4000;


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error: ", err));
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 }); // 30 seconds


// Passport config
require('./config/passport')(passport);












app.use(cors({
    origin: process.env.FRONTEND || 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['set-cookie'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    next();
  });

// Session management

app.use(
    session({
        secret: process.env.SECRET || 'Mess_Portal',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            ttl: 1 * 24 * 60 * 60, // 
            autoRemove: 'interval',
            autoRemoveInterval: 10 // Minutes
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 , // 1 day session duration
            secure: false, // Use `true` for HTTPS
            httpOnly: true,
            sameSite: 'lax',
            path: '/'
        }
    })
);


// Add passport session persistence middleware
app.use((req, res, next) => {
    if (req.session && !req.session.regenerate) {
        req.session.regenerate = true;
        req.session.save(err => {
            if (err) console.error('Session save error:', err);
            next();
        });
    } else {
        next();
    }
});


app.use(passport.initialize());
app.use(passport.session());


//Requests
app.use((req, res, next) => {
    console.log(`Received request for ${req.url}`);
    next();
});







const cron = require("node-cron");
const aggregateSelections = require("./scripts/aggregateSelections");

cron.schedule("0 0 * * 0", async () => {
  console.log("⏳ Running weekly aggregation...");
  await aggregateSelections();
});

aggregateSelections();

// Check authentication for admin endpoints
app.use('/api/admin/*', (req, res, next) => {
    if (req.isAuthenticated() && req.user?.email === process.env.ADMIN) next();
    else res.sendStatus(401);
});

// Check authentication for user endpoints
app.use('/api/user/*', (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.sendStatus(401);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));
app.use('/api/admin/forecast', require('./routes/forecast'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));



// Serve frontend
app.use(express.static(__dirname + '/frontend/build'));
app.get('*', (req, res) => res.sendFile(__dirname + '/frontend/build/index.html'));

// Start server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
