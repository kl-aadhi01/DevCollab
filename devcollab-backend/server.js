const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Setup Socket.IO Handler
const socketHandler = require('./src/socket/socketHandler');
socketHandler(io);

// Initialize scheduled Cron Jobs
const initCronJobs = require('./src/jobs');
initCronJobs(io);

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Attach Socket.IO instance to request context
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const collaborationRoutes = require('./src/routes/collaborationRoutes');
const marketplaceRoutes = require('./src/routes/marketplaceRoutes');
const gamificationRoutes = require('./src/routes/gamificationRoutes');
const onboardingRoutes = require('./src/routes/onboardingRoutes');
const githubRoutes = require('./src/routes/githubRoutes');
const roadmapRoutes = require('./src/routes/roadmapRoutes');
const ratingRoutes = require('./src/routes/ratingRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');
const disputeRoutes = require('./src/routes/disputeRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const suggestionRoutes = require('./src/routes/suggestionRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api', analyticsRoutes);

const githubController = require('./src/controllers/githubController');
const authController = require('./src/controllers/authController');
const auth = require('./src/middleware/auth');

app.get('/api/reliability-score/:userId', auth, githubController.getReliabilityScore);
app.get('/api/portfolio/:username', authController.getPublicPortfolio);
app.patch('/api/profile/visibility', auth, authController.updateVisibility);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
