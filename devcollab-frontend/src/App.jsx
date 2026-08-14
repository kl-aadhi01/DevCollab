import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { GamificationProvider } from './context/GamificationContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import Marketplace from './pages/Marketplace';
import Leaderboard from './pages/Leaderboard';
import PublicPortfolio from './pages/PublicPortfolio';
import Learn from './pages/Learn';
import BootcampDetails from './pages/BootcampDetails';
import MyLearning from './pages/MyLearning';
import MentorDashboard from './pages/MentorDashboard';
import CreateBootcamp from './pages/CreateBootcamp';
import AssignmentView from './pages/AssignmentView';
import TransitionPage from './pages/TransitionPage';
import RecommendedProjects from './pages/RecommendedProjects';
import LearningDashboard from './pages/LearningDashboard';
import LessonView from './pages/LessonView';
import ExerciseView from './pages/ExerciseView';
import GuidedProject from './pages/GuidedProject';
import Capstone from './pages/Capstone';
import ManageBootcamp from './pages/ManageBootcamp';
import LearningRecommendations from './pages/LearningRecommendations';

// Layout & Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import Toast from './components/common/Toast';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <GamificationProvider>
              <div className="flex flex-col min-h-screen bg-background">
                <Toast />
                
                <Navbar />
                
                <main className="flex-grow">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/portfolio/:username" element={<PublicPortfolio />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id" element={<ProjectDetails />} />
                      <Route path="/create-project" element={<CreateProject />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/learn" element={<Learn />} />
                      <Route path="/learn/bootcamp/:id" element={<BootcampDetails />} />
                      <Route path="/learn/bootcamps/:id/dashboard" element={<LearningDashboard />} />
                      <Route path="/learn/bootcamps/:id/manage" element={<ManageBootcamp />} />
                      <Route path="/learn/lessons/:id" element={<LessonView />} />
                      <Route path="/learn/exercises/:id" element={<ExerciseView />} />
                      <Route path="/learn/guided-projects/:id" element={<GuidedProject />} />
                      <Route path="/learn/capstones/:id" element={<Capstone />} />
                      <Route path="/learn/my-learning" element={<MyLearning />} />
                      <Route path="/learn/mentor" element={<MentorDashboard />} />
                      <Route path="/learn/create-bootcamp" element={<CreateBootcamp />} />
                      <Route path="/learn/assignment/:id" element={<AssignmentView />} />
                      <Route path="/learn/transition" element={<TransitionPage />} />
                      <Route path="/learn/recommended-projects" element={<RecommendedProjects />} />
                      <Route path="/learn/recommendations" element={<LearningRecommendations />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                <Footer />
              </div>
            </GamificationProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
