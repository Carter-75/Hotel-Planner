// --- Environment and Dependencies ---
const path = require('path');
const fs = require('fs');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const resolveEnvPath = () => {
  const candidates = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), 'backend', '.env.local'),
    path.join(__dirname, '../.env.local')
  ];
  for (const c of candidates) { if (fs.existsSync(c)) return c; }
  return null;
};
const envPath = resolveEnvPath();
if (envPath) require('dotenv').config({ path: envPath });
else require('dotenv').config(); // Fallback to system env (Vercel)

// --- Initialization ---
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

const app = express();

// --- Configuration ---
const isProd = process.env.PRODUCTION === 'true' && process.env.NODE_ENV === 'production';
const prodUrl = process.env.PROD_FRONTEND_URL;
const PROJECT_NAME = process.env.PROJECT_NAME || 'Portfolio Project';

// Trust proxy for secure cookies on Vercel
if (isProd) {
  app.set('trust proxy', 1);
}

// Frame Ancestors for Iframe Security
const frameAncestors = [
  "'self'",
  "https://carter-portfolio.fyi",
  "https://carter-portfolio.vercel.app",
  "https://*.vercel.app",
  'http://localhost:' + (process.env.PORT || '3000')
];
if (prodUrl) frameAncestors.push(prodUrl);
if (process.env.PROD_BACKEND_URL) frameAncestors.push(process.env.PROD_BACKEND_URL);

// --- Models & Passport Config ---
require('./config/passport')(passport);

// --- Routers ---
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const hotelRouter = require('./routes/hotels');
const reviewRouter = require('./routes/reviews');
const userActionsRouter = require('./routes/user-actions');
const adminRouter = require('./routes/admin');

// --- Diagnostic Routes ---
app.get('/api/health', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  try {
    const hotelCount = await mongoose.model('Hotel').countDocuments();
    res.json({
      status: 'OK',
      database: isConnected ? 'Connected' : 'Disconnected',
      hotelCount: hotelCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      status: 'OK',
      database: isConnected ? 'Connected' : 'Disconnected',
      hotelCount: 0,
      timestamp: new Date().toISOString()
    });
  }
});

// --- MongoDB Setup ---
const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  if (!mongoURI) {
    console.warn('WARN: No MONGODB_URI found in environment!');
    return;
  }

  try {
    console.log('INFO: Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('OK: Connected to MongoDB');
  } catch (err) {
    console.error('ERROR: MongoDB Connection Failed:', err.message);
  }
};

// Initial connection
connectDB();

// --- Middlewares ---

// Wait for DB middleware
const dbCheck = async (req, res, next) => {
  // If we are already connected, proceed
  if (mongoose.connection.readyState === 1) return next();
  
  // If we aren't even trying to connect, try now
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  
  // Wait up to 3 seconds for connection to stabilize
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (mongoose.connection.readyState === 1) {
      clearInterval(interval);
      return next();
    }
    if (attempts >= 30) { // 3 seconds
      clearInterval(interval);
      return res.status(503).json({ 
        error: 'Database connection timeout. Please refresh or check MONGODB_URI.' 
      });
    }
  }, 100);
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "frame-ancestors": frameAncestors,
    },
  },
}));

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd, 
      sameSite: isProd ? 'none' : 'lax'
    }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Apply DB check to all /api routes
app.use('/api', dbCheck);

app.use(cors({
  origin: true,
  credentials: true
}));

// --- Routes ---
app.get('/', (req, res) => {
  res.send('API for ' + PROJECT_NAME + ' is running at /api');
});

app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/user', userActionsRouter);
app.use('/api/admin', adminRouter);




// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
